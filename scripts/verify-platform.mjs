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
  for(const token of ['imageUrl','correctAnswers','maxScore','UniversalImageUploader','Формула']) assert(builder.includes(token),`missing assignment field ${token}`);
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
}else if(mode==='cloudinary-server'){
  const helper=read('lib/cloudinary.ts');
  const sign=read('app/api/media/sign/route.ts');
  const complete=read('app/api/media/complete/route.ts');
  const remove=read('app/api/media/[id]/route.ts');
  const cleanup=read('lib/media-cleanup.ts');
  const schema=read('db/schema.ts');
  for(const route of [sign,complete,remove]){
    assert(route.includes('auth.api.getSession'),'media route lacks server session guard');
    assert(route.includes("['teacher', 'admin']"),'media route lacks teacher/admin role guard');
  }
  assert(helper.includes("import 'server-only'"),'Cloudinary helper is not server-only');
  assert(sign.includes('api_sign_request'),'signed upload is missing');
  assert(!sign.includes('apiSecret,'),'secret appears in upload response');
  assert(complete.includes('client.api.resource'),'completed upload is not verified with Cloudinary');
  assert(complete.includes('db.insert(mediaAssets)'),'verified asset is not persisted');
  assert(cleanup.includes('client.uploader.destroy'),'Cloudinary deletion is missing');
  assert(cleanup.includes("asset.uploadedBy!==userId"),'asset ownership guard is missing');
  assert(cleanup.includes('findMediaAssetReferences'),'referenced media protection is missing');
  assert(schema.includes("'cloudinary'"),'Cloudinary storage provider is missing');
  console.log('cloudinary server verification passed');
}else if(mode==='image-uploader'){
  const uploader=read('components/media/UniversalImageUploader.tsx');
  const course=read('components/teacher/CourseDetailsForm.tsx');
  const lesson=read('components/teacher/LessonBlockEditor.tsx');
  const assignment=read('components/teacher/AssignmentBuilder.tsx');
  const actions=read('app/teacher/courses/actions.ts');
  for(const token of ['type="file"','URL.createObjectURL','XMLHttpRequest','onprogress','role="progressbar"','role="alert"','MAX','/api/media/sign','/api/media/complete','publicId','assetId']) assert(uploader.includes(token.replace('MAX','maxBytes')),`missing uploader capability ${token}`);
  for(const surface of [course,lesson,assignment]) assert(surface.includes('UniversalImageUploader'),'uploader is not connected to every editor');
  assert(assignment.includes('setValue(current=>({...current,prompt:{...current.prompt,...patch}}))'),'async image completion can overwrite newer assignment prompt text');
  assert(actions.includes("formData.get('coverAssetId')"),'course cover asset is not persisted');
  assert(actions.includes("cover.storageProvider!=='cloudinary'"),'course cover is not verified server-side');
  const lessonContent=read('lib/lesson-content.ts');const assignmentContent=read('lib/assignment-content.ts');
  for(const source of [lessonContent,assignmentContent]){assert(/publicId|PublicId/.test(source),'public_id metadata is not persisted');assert(/assetId|AssetId/.test(source),'Neon asset id is not persisted')}
  console.log('universal image uploader verification passed');
}else if(mode==='course-covers'){
  const cover=read('components/courses/CourseCover.tsx');
  const catalog=read('app/courses/page.tsx');
  const detail=read('app/courses/[slug]/page.tsx');
  const teacher=read('app/teacher/courses/page.tsx');
  const profile=read('app/profile/page.tsx');
  const uploader=read('components/media/UniversalImageUploader.tsx');
  assert(cover.includes("url?<img"),'course cover image renderer is missing');
  for(const surface of [catalog,teacher,profile]){assert(surface.includes('mediaAssets'),'cover metadata is not queried');assert(surface.includes('CourseCover'),'course cover is not rendered')}
  assert(detail.includes('mediaAssets'),'course detail cover metadata is not queried');
  assert(detail.includes('cover.publicUrl'),'course detail hero does not render its cover');
  assert(uploader.includes('window.confirm'),'image removal lacks confirmation');
  assert(uploader.includes('Өзгерісті сақтау қажет болады'),'removal confirmation does not explain persistence');
  console.log('course cover verification passed');
}else if(mode==='course-publication'){
  const validator=read('lib/course-publication.ts');
  const actions=read('app/teacher/courses/actions.ts');
  const page=read('app/teacher/courses/[courseId]/page.tsx');
  const readiness=read('components/teacher/PublicationReadiness.tsx');
  for(const code of ["code:'title'","code:'cover'","code:'lesson'","code:'assignment'"]) assert(validator.includes(code),`missing publication rule ${code}`);
  for(const token of ['course.title.trim().length','course.coverMediaId','lessons.isPublished','settings.correctAnswers','settings.correctAnswer','row.maxScore']) assert(validator.includes(token),`missing validation token ${token}`);
  assert(actions.includes('getCoursePublicationIssues(courseId)'),'server publication action does not enforce validator');
  assert(actions.includes('if(issues.length)throw new Error'),'invalid course is not blocked server-side');
  assert(page.includes('disabled={course.status!==\'published\'&&!canPublish}'),'publish button is not disabled for invalid drafts');
  for(const label of ['Курсты жариялау үшін түзетіңіз','мәселе табылды','Курс жариялауға дайын']) assert(readiness.includes(label),`missing publication feedback ${label}`);
  console.log('course publication verification passed');
}else if(mode==='teacher-profile'){
  const profile=read('app/profile/page.tsx');
  for(const table of ['courses','mediaAssets','enrollments','submissions']) assert(profile.includes(table),`teacher profile does not query ${table}`);
  for(const calculation of ['new Set(enrolled.map','Math.round(enrolled.reduce','pendingRows.filter','courseRows.filter']) assert(profile.includes(calculation),`teacher profile calculation missing ${calculation}`);
  for(const label of ['Менің курстарым','Жарияланған курс','Орташа прогресс','Тексеруді күтеді','Редакторды ашу','Курсты көру']) assert(profile.includes(label),`teacher profile surface missing ${label}`);
  assert(profile.includes('CourseCover'),'teacher course cards lack covers');
  assert(profile.includes("course.status==='published'&&<Link"),'public view action is not limited to published courses');
  assert(profile.includes('tabular-nums'),'teacher metrics lack stable numeric typography');
  console.log('teacher profile verification passed');
}else if(mode==='safe-image-deletion'){
  const cleanup=read('lib/media-cleanup.ts');
  const courseActions=read('app/teacher/courses/actions.ts');
  const assignmentActions=read('app/teacher/courses/assignment-actions.ts');
  const route=read('app/api/media/[id]/route.ts');
  const uploader=read('components/media/UniversalImageUploader.tsx');
  for(const table of ['courses.coverMediaId','lessons.content','assignments.prompt']) assert(cleanup.includes(table),`reference scan missing ${table}`);
  for(const key of ['assetId','publicId','imageAssetId','imagePublicId']) assert(cleanup.includes(key),`reference key missing ${key}`);
  assert(cleanup.indexOf('findMediaAssetReferences')<cleanup.indexOf('client.uploader.destroy'),'Cloudinary deletion runs before reference scan');
  assert(cleanup.includes("if(references.length)return{status:'in_use'"),'referenced asset is not protected');
  assert(route.includes("result.status==='in_use'"),'API does not report referenced asset conflict');
  assert(courseActions.includes('previousCoverId!==coverMediaId'),'course replacement/removal is not detected');
  assert(courseActions.includes('oldIds')&&courseActions.includes('newIds'),'lesson image removal is not detected');
  assert(assignmentActions.includes('previous.prompt.imageAssetId!==data.prompt.imageAssetId'),'assignment image removal is not detected');
  for(const source of [courseActions,assignmentActions])assert(source.includes('deleteMediaAssetIfUnused'),'detached asset cleanup is missing');
  assert(uploader.includes('window.confirm'),'removal confirmation is missing');
  console.log('safe image deletion verification passed');
}else if(mode==='legacy-cleanup'){
  assert(!fs.existsSync('app/testent/page.tsx'),'legacy /testent route still exists');
  assert(!fs.existsSync('app/testsss/page.tsx'),'legacy /testsss route still exists');
  const roots=['app','components','lib','proxy.ts'];
  const files=[];const collect=(entry)=>{const stat=fs.statSync(entry);if(stat.isDirectory())for(const name of fs.readdirSync(entry))collect(path.join(entry,name));else if(/\.(ts|tsx)$/.test(entry)||entry==='proxy.ts')files.push(entry)};for(const root of roots)if(fs.existsSync(root))collect(root);
  const source=files.map(read).join('\n');
  for(const legacy of ['/testent','/testsss','AI репетитор','AI негізіндегі','AI көмекшісі']) assert(!source.includes(legacy),`legacy reference remains: ${legacy}`);
  const layout=read('app/layout.tsx');const support=read('app/support/page.tsx');
  assert(layout.includes('title: "GeoKenistik"'),'platform metadata was not updated');
  assert(layout.includes('<html lang="kk"'),'document language is not Kazakh');
  assert(support.includes('Курс немесе сабақ'),'course support FAQ is missing');
  console.log('legacy route cleanup verification passed');
}else throw new Error('unknown verification mode');
