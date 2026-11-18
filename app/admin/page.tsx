import { desc, eq } from 'drizzle-orm';
import { BookOpen, Check, ShieldCheck, UserCheck, Users, X } from 'lucide-react';
import { db } from '@/db/drizzle';
import { courses, user } from '@/db/schema';
import { requireRole } from '@/lib/authorization';
import { PageIntro } from '@/components/platform/PageIntro';
import { approveTeacher, changeCourseStatus, changeUserRole, rejectTeacher, toggleUserBlock } from './actions';

const roleLabel={admin:'Админ',teacher:'Мұғалім',student:'Оқушы'} as const;
const statusLabel={draft:'Жоба',published:'Жарияланған',archived:'Мұрағат'} as const;

export default async function AdminPage(){
  const {session:current}=await requireRole(['admin']);
  const users=await db.select().from(user).orderBy(desc(user.createdAt));
  const courseRows=await db.select({id:courses.id,title:courses.title,status:courses.status,grade:courses.grade,teacherName:user.name,updatedAt:courses.updatedAt}).from(courses).leftJoin(user,eq(courses.teacherId,user.id)).orderBy(desc(courses.updatedAt));
  const pending=users.filter(item=>item.teacherStatus==='pending');
  return <main className="container min-h-screen pb-24 pt-32">
    <PageIntro eyebrow="Қорғалған бөлім" title="Админ панелі" description="Пайдаланушылардың рөлдерін, мұғалім өтінімдерін және барлық курстарды басқарыңыз."/>
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <Stat icon={<Users/>} value={users.length} label="Пайдаланушы"/><Stat icon={<UserCheck/>} value={pending.length} label="Мұғалім өтінімі"/><Stat icon={<BookOpen/>} value={courseRows.length} label="Курс"/>
    </div>

    <section className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><UserCheck className="h-5 w-5"/></span><div><h2 className="text-xl font-bold">Мұғалім өтінімдері</h2><p className="text-sm text-slate-500">Тексерілмеген өтінімдер: {pending.length}</p></div></div>
      <div className="mt-6 space-y-3">{pending.length===0?<Empty text="Жаңа өтінімдер жоқ."/>:pending.map(item=><div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><b className="text-slate-900">{item.name}</b><p className="mt-1 text-sm text-slate-500">{item.email}</p></div><div className="flex gap-2"><form action={approveTeacher.bind(null,item.id)}><button className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white"><Check className="h-4 w-4"/>Растау</button></form><form action={rejectTeacher.bind(null,item.id)}><button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"><X className="h-4 w-4"/>Қабылдамау</button></form></div></div>)}</div>
    </section>

    <section className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Users className="h-5 w-5"/></span><div><h2 className="text-xl font-bold">Пайдаланушылар</h2><p className="text-sm text-slate-500">Рөл мен қолжетімділікті басқару</p></div></div>
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><th className="pb-3">Пайдаланушы</th><th className="pb-3">Рөл</th><th className="pb-3">Күйі</th><th className="pb-3 text-right">Әрекет</th></tr></thead><tbody>{users.map(item=><tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="py-4"><b>{item.name}</b><p className="mt-1 text-xs text-slate-500">{item.email}</p></td><td className="py-4"><form action={changeUserRole} className="flex gap-2"><input type="hidden" name="userId" value={item.id}/><select name="role" defaultValue={item.role} disabled={item.id===current.user.id} className="h-9 rounded-lg border border-slate-200 bg-white px-2"><option value="student">Оқушы</option><option value="teacher">Мұғалім</option><option value="admin">Админ</option></select>{item.id!==current.user.id&&<button className="h-9 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white">Сақтау</button>}</form></td><td className="py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.banned?'bg-rose-50 text-rose-600':'bg-emerald-50 text-emerald-600'}`}>{item.banned?'Бұғатталған':'Белсенді'}</span></td><td className="py-4 text-right">{item.id===current.user.id?<span className="text-xs text-slate-400">Бұл сіз</span>:<form action={toggleUserBlock.bind(null,item.id,!item.banned)}><button className={`text-xs font-bold ${item.banned?'text-emerald-600':'text-rose-600'}`}>{item.banned?'Бұғаттан шығару':'Бұғаттау'}</button></form>}</td></tr>)}</tbody></table></div>
    </section>

    <section className="rounded-[24px] border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><BookOpen className="h-5 w-5"/></span><div><h2 className="text-xl font-bold">Курстарды басқару</h2><p className="text-sm text-slate-500">Барлық мұғалімдердің курстары</p></div></div>
      <div className="mt-6 space-y-3">{courseRows.length===0?<Empty text="Курстар әлі құрылмаған."/>:courseRows.map(course=><div key={course.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><b>{course.title}</b><p className="mt-1 text-xs text-slate-500">{course.grade}-сынып · {course.teacherName??'Мұғалім көрсетілмеген'} · {statusLabel[course.status]}</p></div><form action={changeCourseStatus} className="flex gap-2"><input type="hidden" name="courseId" value={course.id}/><select name="status" defaultValue={course.status} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="draft">Жоба</option><option value="published">Жариялау</option><option value="archived">Мұрағат</option></select><button className="h-10 rounded-xl bg-indigo-500 px-4 text-sm font-bold text-white">Сақтау</button></form></div>)}</div>
    </section>
  </main>
}

function Stat({icon,value,label}:{icon:React.ReactNode;value:number;label:string}){return <article className="rounded-[22px] border border-slate-200 bg-white p-5"><span className="text-indigo-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</span><b className="mt-5 block text-3xl">{value}</b><span className="text-sm text-slate-500">{label}</span></article>}
function Empty({text}:{text:string}){return <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">{text}</div>}
