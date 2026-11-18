import { Box, GraduationCap, Sparkles } from "lucide-react";

export function LandingHero() {
  return (
    <main className="relative left-1/2 min-h-[760px] w-screen -translate-x-1/2 overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e8ebf2 1px, transparent 1px), linear-gradient(to bottom, #e8ebf2 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 90%)",
        }}
      />

      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/50 blur-[100px]" />
      <div className="pointer-events-none absolute -right-48 top-56 h-[600px] w-[600px] rounded-full bg-indigo-200/40 blur-[120px]" />

      <section className="relative z-10 mx-auto flex min-h-[760px] max-w-6xl flex-col items-center justify-center px-5 pb-16 pt-32 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[1px] text-indigo-600 shadow-sm backdrop-blur-md">
          <Sparkles className="h-4 w-4" />
          Платформа әзірленуде
        </div>

        <h1 className="max-w-5xl text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[1.02] tracking-[-0.06em] text-slate-900">
          GeoKenistik
          <span className="mt-2 block bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
            кеңістікті зертте.
          </span>
        </h1>

        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-500 sm:text-xl">
          Болашақ математика мұғалімдеріне арналған интерактивті
          оқу-әдістемелік орта. Геометриялық тапсырманы орындаңыз,
          оқытуды жобалаңыз және нәтижені бағалаңыз.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
            <Box className="h-4 w-4 text-indigo-600" />
            Интерактивті геометрия
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            Мұғалімнің әдістемелік шеберханасы
          </span>
        </div>
      </section>
    </main>
  );
}
