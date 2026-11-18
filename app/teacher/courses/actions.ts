'use server';

import { randomUUID } from 'node:crypto';
import { and, asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db/drizzle';
import { courseSections, courses, lessons } from '@/db/schema';
import { requireRole } from '@/lib/authorization';
import { sanitizeLessonBlocks } from '@/lib/lesson-content';

function clean(value: FormDataEntryValue | null, max=5000){return String(value??'').trim().slice(0,max)}
function slugify(value:string){const slug=value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');return `${slug||'course'}-${randomUUID().slice(0,8)}`}

export async function assertCourseAccess(courseId:string){
  const {session,role}=await requireRole(['teacher','admin']);
  const course=await db.query.courses.findFirst({where:eq(courses.id,courseId)});
  if(!course) throw new Error('Курс табылмады');
  if(role!=='admin'&&course.teacherId!==session.user.id) throw new Error('Бұл курсты өңдеуге рұқсат жоқ');
  return {course,session,role};
}

async function lessonContext(lessonId:string){
  const [row]=await db.select({lesson:lessons,courseId:courseSections.courseId}).from(lessons).innerJoin(courseSections,eq(lessons.sectionId,courseSections.id)).where(eq(lessons.id,lessonId)).limit(1);
  if(!row) throw new Error('Сабақ табылмады');
  await assertCourseAccess(row.courseId); return row;
}

export async function createCourse(formData:FormData){
  const {session}=await requireRole(['teacher','admin']);
  const title=clean(formData.get('title'),160); const description=clean(formData.get('description'),1000);
  if(title.length<3) throw new Error('Курс атауын жазыңыз');
  const [created]=await db.insert(courses).values({title,description,slug:slugify(title),teacherId:session.user.id,status:'draft',grade:10,language:'kk'}).returning({id:courses.id});
  redirect(`/teacher/courses/${created.id}`);
}

export async function updateCourse(courseId:string,formData:FormData){
  await assertCourseAccess(courseId); const title=clean(formData.get('title'),160); if(title.length<3)throw new Error('Курс атауын жазыңыз');
  await db.update(courses).set({title,description:clean(formData.get('description'),1000),updatedAt:new Date()}).where(eq(courses.id,courseId));
  revalidatePath(`/teacher/courses/${courseId}`); revalidatePath('/teacher/courses');
}

export async function addSection(courseId:string,formData:FormData){
  await assertCourseAccess(courseId); const title=clean(formData.get('title'),160); if(!title)throw new Error('Бөлім атауын жазыңыз');
  const last=await db.select({position:courseSections.position}).from(courseSections).where(eq(courseSections.courseId,courseId)).orderBy(desc(courseSections.position)).limit(1);
  await db.insert(courseSections).values({courseId,title,position:(last[0]?.position??-1)+1}); revalidatePath(`/teacher/courses/${courseId}`);
}

export async function addLesson(sectionId:string,formData:FormData){
  const section=await db.query.courseSections.findFirst({where:eq(courseSections.id,sectionId)}); if(!section)throw new Error('Бөлім табылмады'); await assertCourseAccess(section.courseId);
  const title=clean(formData.get('title'),160); if(!title)throw new Error('Сабақ атауын жазыңыз');
  const last=await db.select({position:lessons.position}).from(lessons).where(eq(lessons.sectionId,sectionId)).orderBy(desc(lessons.position)).limit(1);
  await db.insert(lessons).values({sectionId,title,slug:slugify(title),position:(last[0]?.position??-1)+1,content:[]}); revalidatePath(`/teacher/courses/${section.courseId}`);
}

export async function moveSection(sectionId:string,direction:'up'|'down'){
  const current=await db.query.courseSections.findFirst({where:eq(courseSections.id,sectionId)}); if(!current)return; await assertCourseAccess(current.courseId);
  const rows=await db.select().from(courseSections).where(eq(courseSections.courseId,current.courseId)).orderBy(asc(courseSections.position)); const index=rows.findIndex(x=>x.id===sectionId); const target=rows[index+(direction==='up'?-1:1)]; if(!target)return;
  await db.update(courseSections).set({position:target.position}).where(eq(courseSections.id,current.id)); await db.update(courseSections).set({position:current.position}).where(eq(courseSections.id,target.id)); revalidatePath(`/teacher/courses/${current.courseId}`);
}

export async function moveLesson(lessonId:string,direction:'up'|'down'){
  const {lesson,courseId}=await lessonContext(lessonId); const rows=await db.select().from(lessons).where(eq(lessons.sectionId,lesson.sectionId)).orderBy(asc(lessons.position)); const index=rows.findIndex(x=>x.id===lessonId); const target=rows[index+(direction==='up'?-1:1)]; if(!target)return;
  await db.update(lessons).set({position:target.position}).where(eq(lessons.id,lesson.id)); await db.update(lessons).set({position:lesson.position}).where(eq(lessons.id,target.id)); revalidatePath(`/teacher/courses/${courseId}`);
}

export async function updateLesson(lessonId:string,formData:FormData){
  const {courseId}=await lessonContext(lessonId); const title=clean(formData.get('title'),160); if(!title)throw new Error('Сабақ атауын жазыңыз');
  let parsed:unknown=[];try{parsed=JSON.parse(clean(formData.get('contentJson'),100000))}catch{throw new Error('Сабақ материалының пішімі қате')};const content=sanitizeLessonBlocks(parsed);const firstVideo=content.find(block=>block.type==='youtube'&&block.url)?.url||null;
  await db.update(lessons).set({title,summary:clean(formData.get('summary'),500),youtubeUrl:firstVideo,content,isPublished:formData.get('isPublished')==='on'}).where(eq(lessons.id,lessonId));
  revalidatePath(`/teacher/courses/${courseId}`); revalidatePath(`/teacher/courses/${courseId}/lessons/${lessonId}`);
}

export async function setCoursePublication(courseId:string,publish:boolean){
  await assertCourseAccess(courseId);
  if(publish){const available=await db.select({id:lessons.id}).from(lessons).innerJoin(courseSections,eq(lessons.sectionId,courseSections.id)).where(eq(courseSections.courseId,courseId)).limit(1);if(!available.length)throw new Error('Курсты жариялау үшін кемінде бір сабақ қосыңыз');}
  await db.update(courses).set({status:publish?'published':'draft',publishedAt:publish?new Date():null,updatedAt:new Date()}).where(eq(courses.id,courseId)); revalidatePath(`/teacher/courses/${courseId}`); revalidatePath('/courses');
}

export async function deleteSection(sectionId:string){const section=await db.query.courseSections.findFirst({where:eq(courseSections.id,sectionId)});if(!section)return;await assertCourseAccess(section.courseId);await db.delete(courseSections).where(eq(courseSections.id,sectionId));revalidatePath(`/teacher/courses/${section.courseId}`)}
export async function deleteLesson(lessonId:string){const {courseId}=await lessonContext(lessonId);await db.delete(lessons).where(eq(lessons.id,lessonId));revalidatePath(`/teacher/courses/${courseId}`)}
