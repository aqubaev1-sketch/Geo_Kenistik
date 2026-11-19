import Link from "next/link";
import { ArrowUpRight, Box, Play } from "lucide-react";

function GeometryScene() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]" aria-hidden="true">
      <div className="absolute inset-[8%] rounded-full border border-white/60 bg-white/20 shadow-[inset_0_0_80px_rgba(255,255,255,.45)] backdrop-blur-sm" />
      <div className="geo-float absolute left-[12%] top-[16%] h-[38%] w-[38%] rotate-12 rounded-[24%] border-[3px] border-black bg-[#dfff3f] shadow-[18px_20px_0_rgba(0,0,0,.9)]" />
      <div className="geo-float-delay absolute right-[9%] top-[9%] h-[34%] w-[34%] rotate-[24deg] [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-[#ff89d6] drop-shadow-[14px_18px_0_rgba(0,0,0,.85)]" />
      <div className="geo-spin absolute bottom-[10%] left-[27%] h-[40%] w-[40%] rounded-full border-[3px] border-black bg-[#7ee6ff] shadow-[15px_18px_0_rgba(0,0,0,.88)]">
        <div className="absolute inset-[22%] rounded-full border-[3px] border-black bg-[#fffef8]" />
      </div>
      <div className="absolute bottom-[22%] right-[4%] rotate-[-12deg] rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm font-black shadow-[7px_8px_0_#000]">x² + y²</div>
      <div className="absolute left-[2%] top-[54%] rotate-[-8deg] rounded-full bg-black px-4 py-2 text-sm font-bold text-white">3D зертхана</div>
    </div>
  );
}

export function LandingHero() {
  return (
    <main className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[radial-gradient(circle_at_15%_20%,rgba(126,230,255,.85),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(255,137,214,.7),transparent_32%),radial-gradient(circle_at_75%_80%,rgba(255,221,132,.75),transparent_35%),linear-gradient(135deg,#9e91ff_0%,#f6d3ea_48%,#d8f1c1_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:28px_28px]" />
      <section className="container relative z-10 grid min-h-[760px] items-center gap-8 pb-20 pt-32 lg:grid-cols-[1.08fr_.92fr] lg:pb-16 lg:pt-36">
        <div className="max-w-3xl py-8 text-start">
          <div className="hero-reveal inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#fffef8] px-4 py-2 text-sm font-black shadow-[4px_5px_0_#000]">
            <Box className="h-4 w-4" />10-сынып математикасы
          </div>
          <h1 className="hero-reveal hero-reveal-delay mt-7 max-w-[12ch] break-normal text-[clamp(3.6rem,8vw,7.3rem)] font-black leading-[.88] tracking-[-.07em] text-black [overflow-wrap:normal] [text-wrap:balance]">
            Кеңістікті көр. Математиканы түсін.
          </h1>
          <p className="hero-reveal hero-reveal-delay-2 mt-7 max-w-2xl text-lg font-medium leading-8 text-black/75 sm:text-xl">
            Теория, тапсырмалар және интерактивті 3D-модельдер бір жерде. Оқушы үйренеді, мұғалім курс құрып, нәтижені бақылайды.
          </p>
          <div className="hero-reveal hero-reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/courses" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#dfff3f] px-7 text-base font-black text-black shadow-[6px_7px_0_#000] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80">Курстарды бастау<ArrowUpRight className="h-5 w-5" /></Link>
            <Link href="/laboratory" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-black bg-[#fffef8] px-7 text-base font-black text-black transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"><Play className="h-5 w-5 fill-current" />Зертхананы ашу</Link>
          </div>
        </div>
        <div className="hero-reveal hero-reveal-delay-2 min-w-0"><GeometryScene /></div>
      </section>
    </main>
  );
}
