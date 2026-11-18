import fs from 'node:fs';
import path from 'node:path';

const mode=process.argv[2];
const read=(file)=>fs.readFileSync(path.resolve(file),'utf8');
const assert=(value,message)=>{if(!value)throw new Error(message)};

if(mode==='schema'){
  const source=read('db/schema.ts');
  for(const role of ['admin','teacher','student']) assert(source.includes(`'${role}'`),`missing role ${role}`);
  for(const table of ['courses','courseSections','lessons','mediaAssets','enrollments','lessonProgress','assignments','submissions']) assert(source.includes(`export const ${table}`),`missing table ${table}`);
  assert(!/bytea|blob|binary\s*\(/i.test(source),'binary file storage must not be in PostgreSQL');
  assert(source.includes("storageProvider"),'media storage provider metadata missing');
  console.log('schema verification passed');
}else if(mode==='authorization'){
  const authz=read('lib/authorization.ts');
  const admin=read('app/admin/page.tsx');
  const teacher=read('app/teacher/page.tsx');
  assert(authz.includes('auth.api.getSession'),'session is not checked server-side');
  assert(admin.includes("requireRole(['admin'])"),'admin role guard missing');
  assert(teacher.includes("requireRole(['teacher', 'admin'])"),'teacher role guard missing');
  console.log('authorization verification passed');
}else if(mode==='routes'){
  const routes=['app/courses/page.tsx','app/courses/[slug]/page.tsx','app/teacher/page.tsx','app/teacher/courses/page.tsx','app/admin/page.tsx'];
  for(const route of routes) assert(fs.existsSync(route),`missing ${route}`);
  const all=routes.map(read).join('\n');
  for(const word of ['Курстар','Мұғалім','Админ']) assert(all.includes(word),`missing Kazakh interface term ${word}`);
  console.log('route verification passed');
}else if(mode==='admin'){
  const actions=read('app/admin/actions.ts');
  const page=read('app/admin/page.tsx');
  for(const action of ['approveTeacher','rejectTeacher','changeUserRole','toggleUserBlock','changeCourseStatus']) assert(actions.includes(`function ${action}`),`missing admin action ${action}`);
  assert(actions.includes("requireRole(['admin'])"),'admin actions lack server-side guard');
  for(const label of ['Мұғалім өтінімдері','Пайдаланушылар','Курстарды басқару']) assert(page.includes(label),`missing admin surface ${label}`);
  console.log('admin verification passed');
}else if(mode==='course-builder'){
  const actions=read('app/teacher/courses/actions.ts');
  const editor=read('app/teacher/courses/[courseId]/page.tsx');
  const lesson=read('app/teacher/courses/[courseId]/lessons/[lessonId]/page.tsx');
  for(const action of ['createCourse','updateCourse','addSection','addLesson','moveSection','moveLesson','updateLesson','setCoursePublication']) assert(actions.includes(`function ${action}`),`missing course builder action ${action}`);
  assert(actions.includes('assertCourseAccess'),'course ownership guard missing');
  for(const label of ['Курс құрылымы','Бөлім қосу','Жариялау']) assert(editor.includes(label),`missing editor surface ${label}`);
  assert(lesson.includes('Сабақты өңдеу'),'lesson editor missing');
  console.log('course builder verification passed');
}else if(mode==='lesson-editor'){
  const editor=read('components/teacher/LessonBlockEditor.tsx');
  const actions=read('app/teacher/courses/actions.ts');
  for(const type of ['heading','text','formula','image','youtube']) assert(editor.includes(`'${type}'`),`missing ${type} block`);
  for(const token of ['getYouTubeId','img.youtube.com/vi/','contentJson','moveBlock','removeBlock']) assert(editor.includes(token),`missing lesson editor token: ${token}`);
  assert(actions.includes("formData.get('contentJson')"),'lesson action does not persist block JSON');
  console.log('lesson editor verification passed');
}else if(mode==='student-learning'){
  const actions=read('app/courses/actions.ts');
  const lesson=read('app/courses/[slug]/lessons/[lessonId]/page.tsx');
  const renderer=read('components/courses/LessonContentRenderer.tsx');
  for(const action of ['startCourse','completeLesson']) assert(actions.includes(`function ${action}`),`missing student action ${action}`);
  for(const table of ['enrollments','lessonProgress']) assert(actions.includes(table),`missing progress table ${table}`);
  assert(actions.includes("requireRole(['student'])"),'student actions lack role guard');
  for(const type of ['heading','text','formula','image','youtube']) assert(renderer.includes(`block.type === '${type}'`),`missing ${type} renderer`);
  for(const label of ['Сабақты аяқтау','Курс мазмұны','Оқу барысы']) assert(lesson.includes(label),`missing student lesson surface ${label}`);
  console.log('student learning verification passed');
}else if(mode==='assignment-builder'){
  const actions=read('app/teacher/courses/assignment-actions.ts');
  const builder=read('components/teacher/AssignmentBuilder.tsx');
  const page=read('app/teacher/courses/[courseId]/lessons/[lessonId]/page.tsx');
  for(const action of ['createAssignment','updateAssignment','moveAssignment','deleteAssignment']) assert(actions.includes(`function ${action}`),`missing assignment action ${action}`);
  for(const kind of ['single','multiple','number','text','formula']) assert(builder.includes(`'${kind}'`),`missing assignment kind ${kind}`);
  for(const token of ['imageUrl','correctAnswers','maxScore','СУРЕТ СІЛТЕМЕСІ','Формула']) assert(builder.includes(token),`missing assignment field ${token}`);
  assert(page.includes('AssignmentBuilder'),'assignment builder is not mounted in lesson editor');
  console.log('assignment builder verification passed');
}else if(mode==='assignment-player'){
  const actions=read('app/courses/actions.ts');
  const player=read('components/courses/StudentAssignments.tsx');
  const page=read('app/courses/[slug]/lessons/[lessonId]/page.tsx');
  assert(actions.includes('function submitAssignment'),'missing submission action');
  for(const token of ['correctAnswers','tolerance','normalizeFormula','submissions']) assert(actions.includes(token),`missing grading token ${token}`);
  for(const kind of ['single','multiple','number','text','formula']) assert(player.includes(`'${kind}'`),`missing student assignment kind ${kind}`);
  for(const label of ['Жауапты жіберу','Дұрыс жауап','Тексеруді күтеді']) assert(player.includes(label),`missing result surface ${label}`);
  assert(page.includes('StudentAssignments'),'student assignments are not mounted');
  assert(actions.includes('Барлық тапсырманы орындаңыз'),'lesson completion does not enforce submissions');
  console.log('assignment player verification passed');
}else if(mode==='teacher-reviews'){
  const actions=read('app/teacher/reviews/actions.ts');
  const page=read('app/teacher/reviews/page.tsx');
  const dashboard=read('app/teacher/page.tsx');
  for(const action of ['gradeSubmission','requestRevision']) assert(actions.includes(`function ${action}`),`missing review action ${action}`);
  assert(actions.includes("requireRole(['teacher','admin'])"),'review actions lack role guard');
  assert(actions.includes('course.teacherId!==session.user.id'),'course ownership check missing');
  for(const label of ['Тексеруді күтетін жұмыстар','Қабылдау','Қайта орындауға жіберу','Оқушы жауабы']) assert(page.includes(label),`missing review surface ${label}`);
  assert(dashboard.includes('/teacher/reviews'),'teacher dashboard lacks review link');
  console.log('teacher reviews verification passed');
}else if(mode==='results-statistics'){
  const profile=read('app/profile/page.tsx');
  const stats=read('app/teacher/statistics/page.tsx');
  const dashboard=read('app/teacher/page.tsx');
  for(const label of ['Сабақ нәтижелері','Дұрыс жауап','Қате жауап','Жалпы балл']) assert(profile.includes(label),`missing student result surface ${label}`);
  for(const label of ['Оқу статистикасы','Орташа прогресс','Соңғы белсенділік','Нәтиже']) assert(stats.includes(label),`missing teacher statistic surface ${label}`);
  for(const token of ['latestAttempts','progressPercent','maxScore','completedLessons']) assert(stats.includes(token),`missing statistics calculation ${token}`);
  assert(dashboard.includes('/teacher/statistics'),'teacher dashboard lacks statistics link');
  console.log('results statistics verification passed');
}else throw new Error('unknown verification mode');
