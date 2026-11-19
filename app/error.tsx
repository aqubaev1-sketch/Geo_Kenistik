"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

type ErrorPageProps = { error: Error & { digest?: string }; reset: () => void };

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="grid min-h-[72vh] place-items-center bg-[#f6f0dd] px-4 pb-20 pt-28 sm:px-6 md:pt-36">
      <section className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-rose-100 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-12">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-50" />
        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle aria-hidden="true" className="h-8 w-8" /></span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-rose-600">Қате орын алды</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Бетті жүктеу мүмкін болмады</h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">Интернет байланысын тексеріп, әрекетті қайталап көріңіз. Қате қайталанса, басты бетке оралыңыз.</p>
          {error.digest ? <p className="mt-4 text-xs text-slate-400">Қате коды: {error.digest}</p> : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"><RotateCcw aria-hidden="true" className="h-4 w-4" />Қайталап көру</button>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"><Home aria-hidden="true" className="h-4 w-4" />Басты бет</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
