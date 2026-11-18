'use server';

import { randomUUID } from 'node:crypto';
import { asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/drizzle';
import { assignments, courseSections, lessons } from '@/db/schema';
import { sanitizeAssignmentPayload, type AssignmentKind } from '@/lib/assignment-content';
import { assertCourseAccess } from './actions';

async function lessonAccess(lessonId:string){const [row]=await db.select({courseId:courseSections.courseId}).from(lessons).innerJoin(courseSections,eq(lessons.sectionId,courseSections.id)).where(eq(lessons.id,lessonId)).limit(1);if(!row)throw new Error('Сабақ табылмады');await assertCourseAccess(row.courseId);return row.courseId}
async function assignmentAccess(assignmentId:string){const [row]=await db.select({assignment:assignments,courseId:courseSections.courseId}).from(assignments).innerJoin(lessons,eq(assignments.lessonId,lessons.id)).innerJoin(courseSections,eq(lessons.sectionId,courseSections.id)).where(eq(assignments.id,assignmentId)).limit(1);if(!row)throw new Error('Тапсырма табылмады');await assertCourseAccess(row.courseId);return row}
const path=(courseId:string,lessonId:string)=>`/teacher/courses/${courseId}/lessons/${lessonId}`;

export async function createAssignment(formData:FormData){
  const lessonId=String(formData.get('lessonId')??'');const courseId=await lessonAccess(lessonId);const kind=String(formData.get('kind')??'single') as AssignmentKind;
  const last=await db.select({position:assignments.position}).from(assignments).where(eq(assignments.lessonId,lessonId)).orderBy(desc(assignments.position)).limit(1);
  const test=kind==='single'||kind==='multiple';const options=test?[{id:randomUUID(),text:'1-нұсқа'},{id:randomUUID(),text:'2-нұсқа'}]:[];
  await db.insert(assignments).values({lessonId,title:'Жаңа тапсырма',type:test?'test':kind,prompt:{text:'',imageUrl:'',formula:''},settings:{kind,options,correctAnswers:[],correctAnswer:'',sampleAnswer:'',explanation:'',tolerance:0},maxScore:1,position:(last[0]?.position??-1)+1});
  revalidatePath(path(courseId,lessonId));
}

export async function updateAssignment(formData:FormData){
  const assignmentId=String(formData.get('assignmentId')??'');const {assignment,courseId}=await assignmentAccess(assignmentId);let raw:unknown;try{raw=JSON.parse(String(formData.get('payloadJson')??'{}'))}catch{throw new Error('Тапсырма деректері қате')};const data=sanitizeAssignmentPayload(raw);if(!data.title||!data.prompt.text)throw new Error('Тапсырманың атауы мен шартын толтырыңыз');const type=data.kind==='single'||data.kind==='multiple'?'test':data.kind;
  await db.update(assignments).set({title:data.title,type,prompt:data.prompt,settings:{kind:data.kind,options:data.options,correctAnswers:data.correctAnswers,correctAnswer:data.correctAnswer,sampleAnswer:data.sampleAnswer,explanation:data.explanation,tolerance:data.tolerance},maxScore:data.maxScore}).where(eq(assignments.id,assignmentId));
  revalidatePath(path(courseId,assignment.lessonId));
}

export async function moveAssignment(formData:FormData){
  const assignmentId=String(formData.get('assignmentId')??'');const direction=String(formData.get('direction'))==='up'?'up':'down';const {assignment,courseId}=await assignmentAccess(assignmentId);const rows=await db.select().from(assignments).where(eq(assignments.lessonId,assignment.lessonId)).orderBy(asc(assignments.position));const index=rows.findIndex(item=>item.id===assignmentId);const target=rows[index+(direction==='up'?-1:1)];if(!target)return;await db.update(assignments).set({position:target.position}).where(eq(assignments.id,assignmentId));await db.update(assignments).set({position:assignment.position}).where(eq(assignments.id,target.id));revalidatePath(path(courseId,assignment.lessonId));
}

export async function deleteAssignment(formData:FormData){const assignmentId=String(formData.get('assignmentId')??'');const {assignment,courseId}=await assignmentAccess(assignmentId);await db.delete(assignments).where(eq(assignments.id,assignmentId));revalidatePath(path(courseId,assignment.lessonId))}
