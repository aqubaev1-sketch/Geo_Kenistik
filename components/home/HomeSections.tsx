import Link from "next/link";
import { ArrowUpRight, BookOpen, Box, Check, GraduationCap, PenTool, UserRound } from "lucide-react";
import { Doodle } from "@/components/ui/Doodle";

const paths = [
  { icon: BookOpen, title: "Теорияны түсіну", text: "Қысқа түсіндірмелер, формулалар және бейнесабақтар арқылы тақырыпты меңгеріңіз.", color: "bg-[#ff9bd9]" },
  { icon: Box, title: "Модельмен зерттеу", text: "Денелерді айналдырып, жазбалар мен қималарды интерактивті түрде бақылаңыз.", color: "bg-[#7ee6ff]" },
  { icon: Check, title: "Нәтижені бекіту", text: "Тапсырмаларды орындап, түсіндірмені оқып, жеке прогрессіңізді қадағалаңыз.", color: "bg-[#dfff3f]" },
];

export function HomeSections() {
  return (
    <div className="home-gradient-bg pb-14 sm:pb-24">
      <section className="container relative py-16 sm:py-24" aria-labelledby="roles-title">
        <Doodle variant="loop" className="pointer-events-none absolute -right-10 top-2 hidden h-28 w-36 rotate-12 text-black/80 xl:block" />
        <div className="grid items-stretch gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="geo-wiggle flex flex-col justify-between rounded-[34px] bg-black p-7 text-white sm:p-11">
            <div>
              <GraduationCap className="h-11 w-11 text-[#dfff3f]" />
              <h2 id="roles-title" className="mt-8 max-w-lg text-[clamp(2.5rem,5vw,4.8rem)] font-black leading-[.95] tracking-[-.055em]">Бір жерде оқу және оқыту</h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/70">GeoKenistik оқушыға тақырыпты түсінуге, ал мұғалімге сапалы курс құрып, нәтижені бақылауға көмектеседі.</p>
            </div>
            <Link href="/signup" className="mt-10 inline-flex min-h-13 w-fit items-center gap-2 rounded-2xl bg-[#dfff3f] px-6 font-black text-black transition hover:-translate-y-1">Тіркелуді бастау<ArrowUpRight className="h-5 w-5" /></Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <article className="geo-wiggle rotate-[-1deg] rounded-[34px] border-2 border-black bg-[#fffef8] p-7 shadow-[8px_9px_0_#000] sm:p-9">
              <UserRound className="h-10 w-10" />
              <h3 className="mt-12 text-3xl font-black tracking-tight">Оқушыға</h3>
              <ul className="mt-6 space-y-4 text-base leading-6 text-black/70">
                {["Сабақтарды ретімен өту", "3D-модельдермен жұмыс", "Нәтиже мен прогресті көру"].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0" /><span>{item}</span></li>)}
              </ul>
              <Link href="/courses" className="mt-10 inline-flex items-center gap-2 font-black underline decoration-2 underline-offset-4">Курстарды ашу<ArrowUpRight className="h-5 w-5" /></Link>
            </article>
            <article className="geo-wiggle rotate-[1deg] rounded-[34px] border-2 border-black bg-[#ff9bd9] p-7 shadow-[8px_9px_0_#000] sm:p-9">
              <PenTool className="h-10 w-10" />
              <h3 className="mt-12 text-3xl font-black tracking-tight">Мұғалімге</h3>
              <ul className="mt-6 space-y-4 text-base leading-6 text-black/75">
                {["Курс пен сабақ құрастыру", "Формула, видео, тапсырма қосу", "Жауаптар мен статистиканы талдау"].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0" /><span>{item}</span></li>)}
              </ul>
              <Link href="/teacher" className="mt-10 inline-flex items-center gap-2 font-black underline decoration-2 underline-offset-4">Мұғалім кабинеті<ArrowUpRight className="h-5 w-5" /></Link>
            </article>
          </div>
        </div>
      </section>

      <section className="container relative py-12 sm:py-20" aria-labelledby="path-title">
        <Doodle variant="rays" className="pointer-events-none absolute right-4 top-2 h-16 w-16 rotate-12 text-black sm:h-20 sm:w-20" />
        <Doodle variant="wave" className="pointer-events-none absolute -left-24 bottom-12 hidden h-28 w-56 -rotate-12 text-black/80 xl:block" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="path-title" className="max-w-3xl text-[clamp(2.7rem,6vw,5.5rem)] font-black leading-[.92] tracking-[-.06em] text-black">Оқу жолы — қарапайым.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/65">Түсініңіз, модельмен тексеріңіз және нәтижені бекітіңіз.</p>
          </div>
          <Link href="/laboratory" className="inline-flex min-h-13 w-fit items-center gap-2 rounded-2xl border-2 border-black bg-white px-6 font-black shadow-[5px_6px_0_#000]">Зертхананы көру<Box className="h-5 w-5" /></Link>
        </div>

        <ol className="mt-12 grid gap-5 lg:grid-cols-3">
          {paths.map(({ icon: Icon, title, text, color }, index) => (
            <li key={title} className={`${color} geo-wiggle relative min-h-80 overflow-hidden rounded-[34px] border-2 border-black p-7 sm:p-9`}>
              <span className="absolute right-6 top-4 text-7xl font-black text-black/10">{index + 1}</span>
              {index === 1 ? <Doodle variant="spark" className="pointer-events-none absolute -right-4 bottom-0 h-24 w-24 text-black/20" /> : null}
              <Icon className="h-10 w-10" />
              <h3 className="mt-20 max-w-xs text-3xl font-black leading-tight tracking-tight">{title}</h3>
              <p className="mt-4 max-w-sm text-base leading-7 text-black/70">{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}