import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[72vh] place-items-center bg-[#f6f0dd] px-4 pb-20 pt-28 sm:px-6 md:pt-36">
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-14">
        <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-indigo-100/60 blur-2xl" />
        <div className="relative">
          <p className="text-7xl font-black tracking-tighter text-indigo-600 sm:text-8xl">404</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Бет табылмады</h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">Сілтеме ескірген немесе мекенжай қате жазылған болуы мүмкін. Басты бетке оралыңыз немесе курстарды ашыңыз.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Басты бетке оралу</Link>
            <Link href="/courses" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-6 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"><BookOpen aria-hidden="true" className="h-4 w-4" />Курстарды қарау</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
