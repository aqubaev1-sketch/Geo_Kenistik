import Link from "next/link";
import { ArrowUpRight, BookOpen, Box, ListChecks, Play } from "lucide-react";

const HEX = "200,60 300,118 300,234 200,292 100,234 100,118";

function GeometryScene() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]" aria-hidden="true">
      <div className="absolute inset-[6%] rounded-full border border-white/60 bg-white/25 shadow-[inset_0_0_80px_rgba(255,255,255,.5)] backdrop-blur-sm" />

      {/* main cube: flat colour faces, thick outline, hard shadow */}
      <svg viewBox="0 0 400 400" className="geo-float absolute inset-0 h-full w-full" fill="none">
        <polygon points={HEX} transform="translate(16 18)" fill="#000" />
        <polygon points="200,60 300,118 200,176 100,118" fill="#dfff3f" />
        <polygon points="200,176 300,118 300,234 200,292" fill="#ff89d6" />
        <polygon points="100,118 200,176 200,292 100,234" fill="#7ee6ff" />
        <g stroke="#000" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
          <polygon points={HEX} />
          <polyline points="100,118 200,176 300,118" />
          <line x1="200" y1="176" x2="200" y2="292" />
        </g>
        <g stroke="#000" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" opacity=".55">
          <line x1="200" y1="176" x2="200" y2="60" />
          <line x1="200" y1="176" x2="100" y2="234" />
          <line x1="200" y1="176" x2="300" y2="234" />
        </g>
        <line x1="100" y1="118" x2="300" y2="118" stroke="#000" strokeWidth="3" strokeDasharray="10 8" />
      </svg>

      {/* satellites */}
      <div className="geo-float-delay absolute right-[2%] top-[4%] h-[26%] w-[26%] rotate-[24deg] [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-[#ffdd84] drop-shadow-[10px_12px_0_rgba(0,0,0,.85)]" />
      <div className="geo-spin absolute bottom-[6%] left-[8%] h-[24%] w-[24%] rounded-full border-[3px] border-black bg-[#7ee6ff] shadow-[10px_12px_0_rgba(0,0,0,.88)]">
        <div className="absolute inset-[22%] rounded-full border-[3px] border-black bg-[#fffef8]" />
      </div>

      {/* stickers */}
      <div className="absolute right-[2%] top-[46%] rotate-[-10deg] rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm font-black shadow-[7px_8px_0_#000]">V = a³</div>
      <div className="absolute bottom-[12%] right-[10%] rotate-[6deg] rounded-2xl border-2 border-black bg-[#dfff3f] px-4 py-3 text-sm font-black shadow-[7px_8px_0_#000]">x² + y²</div>
      <div className="absolute left-[1%] top-[22%] rotate-[-8deg] rounded-full bg-black px-4 py-2 text-sm font-bold text-white">3D зертхана</div>
    </div>
  );
}

const FEATURES = [
  { icon: BookOpen, title: "Теория", bg: "bg-[#fffef8]" },
  { icon: ListChecks, title: "Тапсырмалар", bg: "bg-[#dfff3f]" },
  { icon: Box, title: "3D-модельдер", bg: "bg-[#7ee6ff]" },
];

export function LandingHero() {
  return (
    <main className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[radial-gradient(circle_at_15%_20%,rgba(126,230,255,.85),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(255,137,214,.7),transparent_32%),radial-gradient(circle_at_75%_80%,rgba(255,221,132,.75),transparent_35%),linear-gradient(135deg,#9e91ff_0%,#f6d3ea_48%,#d8f1c1_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:28px_28px]" />
      <section className="container relative z-10 grid items-center gap-8 pb-10 pt-32 lg:grid-cols-[1.08fr_.92fr] lg:pt-36">
        <div className="max-w-3xl py-8 text-start">
          <div className="hero-reveal inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#fffef8] px-4 py-2 text-sm font-black shadow-[4px_5px_0_#000]">
            <Box className="h-4 w-4" />10-сынып математикасы
          </div>
          <h1 className="hero-reveal hero-reveal-delay mt-7 break-normal text-[clamp(2rem,4.8vw,5.5rem)] font-black leading-[.95] tracking-[-.06em] text-black [overflow-wrap:normal] [text-wrap:balance]">
  Кеңістікті көр.{" "}
  <span className="inline-block -rotate-1 whitespace-nowrap border-2 border-black bg-[#dfff3f] px-3 py-1 shadow-[6px_7px_0_#000]">
    Математиканы түсін.
  </span>
</h1>
          
          <div className="hero-reveal hero-reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/courses" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-black bg-[#dfff3f] px-7 text-base font-black text-black shadow-[3px_4px_0_#000] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80">Курстарды бастау<ArrowUpRight className="h-5 w-5" /></Link>
            <Link href="/laboratory" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-black bg-[#fffef8] px-7 text-base font-black text-black shadow-[3px_4px_0_#000] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"><Play className="h-5 w-5 fill-current" />Зертхананы ашу</Link>
          </div>
        </div>
        <div className="hero-reveal hero-reveal-delay-2 min-w-0"><GeometryScene /></div>
      </section>

      <section className="container relative z-10 pb-16">
        <ul className="hero-reveal hero-reveal-delay-3 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, bg }, i) => (
            <li key={title} className={`flex items-center gap-4 rounded-2xl border-2 border-black ${bg} px-5 py-4 shadow-[6px_7px_0_#000]`}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white"><Icon className="h-6 w-6" /></span>
              <span className="text-lg font-black leading-tight"><span className="mr-2 text-sm opacity-50">0{i + 1}</span>{title}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}