import 'server-only';

import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { assignments, courseSections, courses, lessons, mediaAssets } from '@/db/schema';

export type PublicationIssue={code:'title'|'cover'|'lesson'|'assignment';message:string;lessonId?:string;assignmentId?:string};
const record=(value:unknown)=>value&&typeof value==='object'?value as Record<string,unknown>:{};
const text=(value:unknown)=>String(value??'').trim();

function assignmentIssues(row:{id:string;title:string;type:string;prompt:unknown;settings:unknown;maxScore:number;lessonId:string;lessonTitle:string}):PublicationIssue[]{
  const prompt=record(row.prompt);const settings=record(row.settings);const kind=text(settings.kind)||(row.type==='test'?'single':row.type);const name=text(row.title)||'Атаусыз тапсырма';const prefix=`«${row.lessonTitle}» сабағындағы «${name}»`;
  const issues:PublicationIssue[]=[];const add=(message:string)=>issues.push({code:'assignment',message:`${prefix}: ${message}`,lessonId:row.lessonId,assignmentId:row.id});
  if(text(row.title).length<2)add('тапсырма атауын толтырыңыз');
  if(!text(prompt.text))add('тапсырма шартын жазыңыз');
  if(!Number.isInteger(row.maxScore)||row.maxScore<1||row.maxScore>100)add('балл 1–100 аралығында болуы керек');
  if(kind==='single'||kind==='multiple'){
    const options=Array.isArray(settings.options)?settings.options.map(record):[];const validOptions=options.filter(option=>text(option.id)&&text(option.text));const ids=new Set(validOptions.map(option=>text(option.id)));const answers=Array.isArray(settings.correctAnswers)?settings.correctAnswers.map(text).filter(id=>ids.has(id)):[];
    if(validOptions.length<2)add('кемінде екі толық жауап нұсқасын қосыңыз');
    if(kind==='single'&&answers.length!==1)add('бір дұрыс жауапты белгілеңіз');
    if(kind==='multiple'&&answers.length<1)add('кемінде бір дұрыс жауапты белгілеңіз');
  }else if(kind==='number'){
    if(!text(settings.correctAnswer)||!Number.isFinite(Number(settings.correctAnswer)))add('дұрыс сандық жауапты енгізіңіз');
  }else if(kind==='formula'){
    if(!text(settings.correctAnswer))add('дұрыс формуланы енгізіңіз');
  }else if(kind!=='text')add('тапсырма түрі қолдау көрсетілмейді');
  return issues;
}

export async function getCoursePublicationIssues(courseId:string):Promise<PublicationIssue[]>{
  const course=await db.query.courses.findFirst({where:eq(courses.id,courseId)});if(!course)return[{code:'title',message:'Курс табылмады'}];const issues:PublicationIssue[]=[];
  if(course.title.trim().length<3)issues.push({code:'title',message:'Курс атауы кемінде 3 таңбадан тұруы керек'});
  const cover=course.coverMediaId?await db.query.mediaAssets.findFirst({where:and(eq(mediaAssets.id,course.coverMediaId),eq(mediaAssets.storageProvider,'cloudinary'))}):null;
  if(!cover?.publicUrl)issues.push({code:'cover',message:'Курс мұқабасын жүктеңіз'});
  const published=await db.select({id:lessons.id,title:lessons.title}).from(lessons).innerJoin(courseSections,eq(lessons.sectionId,courseSections.id)).where(and(eq(courseSections.courseId,courseId),eq(lessons.isPublished,true)));
  if(!published.length)issues.push({code:'lesson',message:'Кемінде бір сабақты «Сабақ дайын» деп белгілеңіз'});
  if(published.length){const rows=await db.select({id:assignments.id,title:assignments.title,type:assignments.type,prompt:assignments.prompt,settings:assignments.settings,maxScore:assignments.maxScore,lessonId:lessons.id,lessonTitle:lessons.title}).from(assignments).innerJoin(lessons,eq(assignments.lessonId,lessons.id)).where(inArray(assignments.lessonId,published.map(item=>item.id)));for(const row of rows)issues.push(...assignmentIssues(row));}
  return issues;
}
