"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="container grid min-h-[70vh] place-items-center pb-20 pt-32"><section className="w-full max-w-lg rounded-[28px] border border-rose-100 bg-white p-7 text-center shadow-sm sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle className="h-7 w-7"/></span><h1 className="mt-6 text-2xl font-bold text-slate-900">Бетті жүктеу мүмкін болмады</h1><p className="mt-3 text-sm leading-6 text-slate-600">Байланысты тексеріп, әрекетті қайталап көріңіз. Қате қайталанса, басты бетке оралыңыз.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={reset} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white"><RotateCcw className="h-4 w-4"/>Қайталап көру</button><Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700">Басты бет</Link></div></section></main>;
}
