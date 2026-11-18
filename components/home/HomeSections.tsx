import Link from "next/link";
import { ArrowRight, BookOpen, Box, CheckCircle2, GraduationCap, PenTool, UserRound } from "lucide-react";

export function HomeSections() {
  return <div className="bg-white pb-16 sm:pb-24">
    <section className="container py-16 sm:py-24" aria-labelledby="roles-title">
      <div className="grid overflow-hidden rounded-[30px] border border-indigo-100 bg-indigo-50/60 lg:grid-cols-[.9fr_1.1fr]">
        <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14">
          <div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white"><GraduationCap className="h-5 w-5"/></span>
            <h2 id="roles-title" className="mt-7 max-w-md text-[clamp(2rem,1.7rem+1.2vw,3rem)] leading-[1.08] font-bold tracking-[-.04em] text-slate-950 [text-wrap:balance]">Бір платформада оқу және оқыту</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">Оқушы материалды меңгеріп, тапсырмалар орындайды. Мұғалім курс құрып, әр оқушының нәтижесін бақылайды.</p>
          </div>
          <Link href="/signup" className="mt-9 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Тіркелуді бастау<ArrowRight className="h-4 w-4"/></Link>
        </div>

        <div className="grid gap-px bg-indigo-100 sm:grid-cols-2">
          <article className="bg-white p-7 sm:p-9">
            <UserRound className="h-7 w-7 text-indigo-600"/>
            <h3 className="mt-8 text-xl font-bold text-slate-900">Оқушыға</h3>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              {['Сабақтарды ретімен өту','Интерактивті модельдермен жұмыс','Нәтиже мен прогресті көру'].map(item=><li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500"/><span>{item}</span></li>)}
            </ul>
            <Link href="/courses" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-indigo-700">Курстарды ашу<ArrowRight className="h-4 w-4"/></Link>
          </article>
          <article className="bg-slate-950 p-7 text-white sm:p-9">
            <PenTool className="h-7 w-7 text-indigo-300"/>
            <h3 className="mt-8 text-xl font-bold">Мұғалімге</h3>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              {['Курс пен сабақ құрастыру','Формула, видео және тапсырма қосу','Жауаптар мен статистиканы талдау'].map(item=><li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-indigo-300"/><span>{item}</span></li>)}
            </ul>
            <Link href="/teacher" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-indigo-300">Мұғалім кабинеті<ArrowRight className="h-4 w-4"/></Link>
          </article>
        </div>
      </div>
    </section>

    <section className="container pb-8 sm:pb-16" aria-labelledby="path-title">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 id="path-title" className="text-[clamp(2rem,1.7rem+1.2vw,3rem)] leading-[1.08] font-bold tracking-[-.04em] text-slate-950">Оқу бағыты</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Теориядан тәжірибеге, одан нақты нәтижеге өтетін бірізді оқу жолы.</p></div>
        <Link href="/laboratory" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-indigo-200 px-4 text-sm font-bold text-indigo-700">Зертхананы көру<Box className="h-4 w-4"/></Link>
      </div>
      <ol className="grid divide-y divide-slate-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {[
          {n:'01',icon:BookOpen,title:'Теорияны түсіну',text:'Қысқа түсіндірмелер, формулалар және бейнесабақтар арқылы тақырыпты меңгеріңіз.'},
          {n:'02',icon:Box,title:'Модельмен зерттеу',text:'Кеңістіктік денелерді айналдырып, жазбалар мен қималарды интерактивті түрде бақылаңыз.'},
          {n:'03',icon:CheckCircle2,title:'Нәтижені бекіту',text:'Тапсырмаларды орындап, түсіндірмені оқып, жеке прогрессіңізді қадағалаңыз.'},
        ].map(({n,icon:Icon,title,text})=><li key={n} className="relative py-8 lg:px-8 lg:py-10 first:lg:pl-0 last:lg:pr-0"><span className="text-sm font-bold tabular-nums text-indigo-500">{n}</span><Icon className="mt-8 h-6 w-6 text-slate-900"/><h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{text}</p></li>)}
      </ol>
    </section>
  </div>;
}
