'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/drizzle';
import { assignments, courseSections, courses, lessons, submissions } from '@/db/schema';
import { requireRole } from '@/lib/authorization';
import { syncFinalAssessmentCompletion } from '@/lib/final-assessment';

async function reviewContext(submissionId:string){
  const {session,role}=await requireRole(['teacher','admin']);
  const [row]=await db.select({submission:submissions,assignment:assignments,lessonId:lessons.id,isFinalAssessment:lessons.isFinalAssessment,course:courses}).from(submissions).innerJoin(assignments,eq(submissions.assignmentId,assignments.id)).innerJoin(lessons,eq(assignments.lessonId,lessons.id)).innerJoin(courseSections,eq(lessons.sectionId,courseSections.id)).innerJoin(courses,eq(courseSections.courseId,courses.id)).where(eq(submissions.id,submissionId)).limit(1);
  if(!row)throw new Error('Жұмыс табылмады');if(role!=='admin'&&row.course.teacherId!==session.user.id)throw new Error('Бұл жұмысты тексеруге рұқсат жоқ');return row;
}
const clean=(value:FormDataEntryValue|null,max=5000)=>String(value??'').trim().slice(0,max);
const refresh=(slug:string,lessonId:string)=>{revalidatePath('/teacher/reviews');revalidatePath('/teacher');revalidatePath(`/courses/${slug}`);revalidatePath(`/courses/${slug}/lessons/${lessonId}`)};

export async function gradeSubmission(formData:FormData){
  const submissionId=clean(formData.get('submissionId'),80);const row=await reviewContext(submissionId);const raw=Number(formData.get('score'));if(!Number.isFinite(raw)||raw<0||raw>row.assignment.maxScore)throw new Error(`Балл 0 мен ${row.assignment.maxScore} аралығында болуы керек`);const feedback=clean(formData.get('feedback'));
  await db.update(submissions).set({status:'checked',score:Math.round(raw),feedback:feedback||'Жұмыс тексерілді.',checkedAt:new Date()}).where(eq(submissions.id,submissionId));if(row.isFinalAssessment)await syncFinalAssessmentCompletion(row.course.id,row.submission.studentId);refresh(row.course.slug,row.lessonId);if(row.isFinalAssessment)revalidatePath(`/courses/${row.course.slug}/final`);revalidatePath('/profile');
}

export async function requestRevision(formData:FormData){
  const submissionId=clean(formData.get('submissionId'),80);const row=await reviewContext(submissionId);const feedback=clean(formData.get('feedback'));if(!feedback)throw new Error('Оқушыға нені түзету керегін жазыңыз');
  await db.update(submissions).set({status:'revision',score:null,feedback,checkedAt:new Date()}).where(eq(submissions.id,submissionId));refresh(row.course.slug,row.lessonId);
}
