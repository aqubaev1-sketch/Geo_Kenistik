'use server';

import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db/drizzle';
import { assignments, courseSections, courses, enrollments, lessonProgress, lessons, submissions } from '@/db/schema';
import { requireRole } from '@/lib/authorization';
import { findFinalAssessment, syncFinalAssessmentCompletion } from '@/lib/final-assessment';

async function publishedLessons(courseId:string){
  return db.select({id:lessons.id}).from(lessons).innerJoin(courseSections,eq(lessons.sectionId,courseSections.id)).where(and(eq(courseSections.courseId,courseId),eq(lessons.isPublished,true),eq(lessons.isFinalAssessment,false))).orderBy(asc(courseSections.position),asc(lessons.position));
}

const normalizeFormula=(value:string)=>value.replace(/\s+/g,'').replace(/\\left|\\right/g,'').toLowerCase();

export async function submitAssignment(courseId:string,slug:string,lessonId:string,assignmentId:string,formData:FormData){
  const {session}=await requireRole(['student']);
  const enrollment=await db.query.enrollments.findFirst({where:and(eq(enrollments.courseId,courseId),eq(enrollments.studentId,session.user.id))});if(!enrollment)redirect(`/courses/${slug}`);
  const [task]=await db.select({id:assignments.id,type:assignments.type,settings:assignments.settings,maxScore:assignments.maxScore,isFinalAssessment:lessons.isFinalAssessment}).from(assignments).innerJoin(lessons,eq(assignments.lessonId,lessons.id)).innerJoin(courseSections,eq(lessons.sectionId,courseSections.id)).where(and(eq(assignments.id,assignmentId),eq(assignments.lessonId,lessonId),eq(courseSections.courseId,courseId),eq(lessons.isPublished,true))).limit(1);if(!task)throw new Error('Тапсырма табылмады');
  const settings=task.settings&&typeof task.settings==='object'?task.settings as Record<string,unknown>:{};const kind=String(settings.kind||task.type);let answer:unknown;let score:number|null=null;let status:'submitted'|'checked'='checked';let correct=false;
  if(kind==='single'||kind==='multiple'){const selected=formData.getAll('answer').map(String);const expected=Array.isArray(settings.correctAnswers)?settings.correctAnswers.map(String):[];answer=selected;correct=selected.length===expected.length&&selected.every(item=>expected.includes(item));score=correct?task.maxScore:0}
  else if(kind==='number'){const value=Number(formData.get('answer'));const expected=Number(settings.correctAnswer);const tolerance=Math.max(0,Number(settings.tolerance)||0);answer=String(formData.get('answer')??'');correct=Number.isFinite(value)&&Number.isFinite(expected)&&Math.abs(value-expected)<=tolerance;score=correct?task.maxScore:0}
  else if(kind==='formula'){const value=String(formData.get('answer')??'');answer=value;correct=normalizeFormula(value)===normalizeFormula(String(settings.correctAnswer||''));score=correct?task.maxScore:0}
  else{answer=String(formData.get('answer')??'').trim().slice(0,10000);if(!answer)throw new Error('Жауапты жазыңыз');status='submitted'}
  const explanation=String(settings.explanation||'').slice(0,5000);const feedback=status==='submitted'?'Мұғалімнің тексеруін күтеді.':correct?(explanation||'Дұрыс жауап.'):(explanation||'Жауапты қайта тексеріңіз.');
  await db.insert(submissions).values({assignmentId,studentId:session.user.id,answer,status,score,feedback,checkedAt:status==='checked'?new Date():null});
  await db.update(enrollments).set({lastActiveAt:new Date()}).where(eq(enrollments.id,enrollment.id));if(task.isFinalAssessment)await syncFinalAssessmentCompletion(courseId,session.user.id);revalidatePath(task.isFinalAssessment?`/courses/${slug}/final`:`/courses/${slug}/lessons/${lessonId}`);revalidatePath('/profile');
}

export async function startCourse(courseId:string,slug:string){
  const {session}=await requireRole(['student']);
  const course=await db.query.courses.findFirst({where:and(eq(courses.id,courseId),eq(courses.slug,slug),eq(courses.status,'published'))});
  if(!course) throw new Error('Курс табылмады');
  const ordered=await publishedLessons(courseId);if(!ordered.length)throw new Error('Курста жарияланған сабақ жоқ');
  const existing=await db.query.enrollments.findFirst({where:and(eq(enrollments.courseId,courseId),eq(enrollments.studentId,session.user.id))});
  await db.insert(enrollments).values({courseId,studentId:session.user.id,lastActiveAt:new Date()}).onConflictDoUpdate({target:[enrollments.courseId,enrollments.studentId],set:{lastActiveAt:new Date()}});
  const progress=await db.select({lessonId:lessonProgress.lessonId,status:lessonProgress.status}).from(lessonProgress).where(and(eq(lessonProgress.studentId,session.user.id),inArray(lessonProgress.lessonId,ordered.map(item=>item.id))));
  const completed=new Set(progress.filter(item=>item.status==='completed').map(item=>item.lessonId));
  const destination=ordered.find(item=>!completed.has(item.id))?.id??ordered.at(-1)!.id;
  if(!existing||!progress.some(item=>item.lessonId===destination))await db.insert(lessonProgress).values({lessonId:destination,studentId:session.user.id,status:'in_progress',startedAt:new Date(),lastActiveAt:new Date()}).onConflictDoNothing();
  redirect(`/courses/${slug}/lessons/${destination}`);
}

export async function completeLesson(courseId:string,slug:string,lessonId:string){
  const {session}=await requireRole(['student']);
  const enrollment=await db.query.enrollments.findFirst({where:and(eq(enrollments.courseId,courseId),eq(enrollments.studentId,session.user.id))});
  if(!enrollment)redirect(`/courses/${slug}`);
  const ordered=await publishedLessons(courseId);const index=ordered.findIndex(item=>item.id===lessonId);if(index<0)throw new Error('Сабақ табылмады');
  const lessonTasks=await db.select({id:assignments.id}).from(assignments).where(eq(assignments.lessonId,lessonId));
  if(lessonTasks.length){const attempts=await db.select({assignmentId:submissions.assignmentId,status:submissions.status}).from(submissions).where(and(eq(submissions.studentId,session.user.id),inArray(submissions.assignmentId,lessonTasks.map(item=>item.id)))).orderBy(desc(submissions.submittedAt));const latest=new Map<string,string>();for(const item of attempts)if(!latest.has(item.assignmentId))latest.set(item.assignmentId,item.status);if(lessonTasks.some(item=>!latest.has(item.id)||latest.get(item.id)==='revision'))throw new Error('Барлық тапсырманы орындаңыз')}
  const now=new Date();
  await db.insert(lessonProgress).values({lessonId,studentId:session.user.id,status:'completed',startedAt:now,completedAt:now,lastActiveAt:now}).onConflictDoUpdate({target:[lessonProgress.lessonId,lessonProgress.studentId],set:{status:'completed',completedAt:now,lastActiveAt:now}});
  const rows=await db.select({lessonId:lessonProgress.lessonId,status:lessonProgress.status}).from(lessonProgress).where(and(eq(lessonProgress.studentId,session.user.id),inArray(lessonProgress.lessonId,ordered.map(item=>item.id))));
  const completedCount=new Set(rows.filter(item=>item.status==='completed').map(item=>item.lessonId)).size;
  const percent=Math.round(completedCount/ordered.length*100);const finished=percent===100;const finalAssessment=finished?await findFinalAssessment(courseId):null;
  await db.update(enrollments).set({progressPercent:percent,lastActiveAt:now,completedAt:finished&&!finalAssessment?.isPublished?now:enrollment.completedAt}).where(eq(enrollments.id,enrollment.id));
  const next=ordered[index+1];
  if(next){await db.insert(lessonProgress).values({lessonId:next.id,studentId:session.user.id,status:'in_progress',startedAt:now,lastActiveAt:now}).onConflictDoUpdate({target:[lessonProgress.lessonId,lessonProgress.studentId],set:{lastActiveAt:now}});revalidatePath(`/courses/${slug}`);redirect(`/courses/${slug}/lessons/${next.id}`)}
  revalidatePath(`/courses/${slug}`);revalidatePath('/profile');redirect(`/courses/${slug}?completed=1`);
}
