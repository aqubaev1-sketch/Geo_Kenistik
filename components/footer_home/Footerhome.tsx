
import Link from "next/link";
import {
  FaInstagram,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";
import { Fredoka } from "next/font/google";
import { Doodle } from "@/components/ui/Doodle";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

export default function FooterHome({ showCta = true }: { showCta?: boolean }) {
  return (
    <footer className="w-full bg-[#f6f0dd]">
      <div className="w-full overflow-hidden bg-black text-white">

        {/* ================= CTA ================= */}
        {showCta ? <div className="relative flex flex-col items-center overflow-hidden px-6 pb-16 pt-16 text-center sm:pt-20 lg:pt-24">
          <Doodle variant="wave" className="pointer-events-none absolute -left-10 top-10 hidden h-28 w-64 rotate-12 text-white/30 md:block" />
          <Doodle variant="spark" className="pointer-events-none absolute right-[7%] top-[15%] h-20 w-20 text-[#dfff3f] sm:h-28 sm:w-28" />
          <Doodle variant="rays" className="pointer-events-none absolute bottom-10 right-[18%] hidden h-16 w-16 text-white/40 sm:block" />
          

          <h2 className="max-w-4xl text-4xl font-black leading-[.95] tracking-[-.045em] sm:text-5xl lg:text-7xl">
            Математиканы жүйелі түрде меңгеріңіз.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Теорияны оқып, бейнесабақты көріп, тапсырмаларды орындаңыз
            және оқу ілгерілеуіңізді бақылаңыз.
          </p>

          <div className="relative mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Doodle variant="arrow" className="pointer-events-none absolute -left-28 top-0 hidden h-14 w-20 rotate-12 text-[#dfff3f] lg:block" />
            <Link
              href="/courses"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#dfff3f] px-6 text-sm font-black text-black transition-all hover:-translate-y-1 sm:w-auto"
            >
              <BookOpen className="h-4 w-4" />
              Курстарды көру
              
            </Link>

            <Link
              href="/laboratory"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition-all hover:bg-white/15 sm:w-auto"
            >
              Зертхананы ашу
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div> : null}

        {/* Divider */}
        {showCta ? <div className="mx-6 h-px bg-white/20 sm:mx-12 lg:mx-20" /> : null}

        {/* ================= MAIN FOOTER ================= */}
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-12 px-6 py-16 sm:px-12 md:grid-cols-[1.05fr_.8fr_1fr] md:gap-20 lg:px-16 xl:gap-28 xl:px-20">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className={`${fredoka.className} inline-flex items-center text-[#ffffff] text-[32px] font-bold tracking-tight no-underline pr-8`}
            >
              GeoKenistik
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-[1.8] text-[#E3D9FF]">
              10-сынып оқушыларына арналған қазақ тіліндегі
              математика оқу платформасы.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[1px] text-white">
              Платформа
            </h3>

            <ul className="space-y-4">
              {[
                { label: "Басты бет", href: "/" },
                { label: "Курстар", href: "/courses" },
                { label: "Интерактивті зертхана", href: "/laboratory" },
                { label: "Қолдау қызметі", href: "/support" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#E3D9FF] transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[1px] text-white">
              Байланыс
            </h3>

            <div className="space-y-4">
              <a
                href="mailto:info@qyzpu.edu.kz"
                className="flex items-center gap-3 text-sm text-[#E3D9FF] transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0" />
                info@qyzpu.edu.kz
              </a>

              <a
                href="tel:+77272370095"
                className="flex items-center gap-3 text-sm text-[#E3D9FF] transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +7 (727) 237-00-95
              </a>

              <div className="flex items-center gap-3 pt-3">
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:-translate-y-1 hover:bg-white/20"
                >
                  <FaInstagram size={18} />
                </Link>

                <Link
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:-translate-y-1 hover:bg-white/20"
                >
                  <FaTelegramPlane size={18} />
                </Link>

                <Link
                  href="https://wa.me/77471401404"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:-translate-y-1 hover:bg-white/20"
                >
                  <FaWhatsapp size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="mx-auto h-px w-[calc(100%-48px)] max-w-[1440px] bg-white/20 sm:w-[calc(100%-96px)]" />

        <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-12 lg:px-16 xl:px-20">
          <p className="text-center text-xs text-[#D6C7F7] md:text-left">
            © 2026 GeoKenistik. Барлық құқықтар қорғалған.
          </p>
        </div>

      </div>
    </footer>
  );
}
