"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { Fredoka } from "next/font/google";
import { authClient } from "@/lib/auth-client";

const fredoka = Fredoka({ subsets: ["latin"], weight: "700", display: "swap" });

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const isAdmin = session?.user.role === "admin";

  const closeMenu = () => setIsMenuOpen(false);
  const handleSignIn = () => {
    closeMenu();
    window.location.assign("/login");
  };
  const handleLogout = async () => {
    closeMenu();
    await authClient.signOut();
    window.location.assign("/");
  };

  const navClass = "block rounded-xl px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-[#efff75] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff3f]/50 md:px-2 md:py-2";

  return (
    <>
      <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-20px)] max-w-[1240px] -translate-x-1/2 sm:top-5">
        <nav className="relative flex min-h-[70px] items-center justify-between rounded-[24px] border border-white/80 bg-[#fffef8]/95 px-4 shadow-[0_18px_50px_rgba(28,18,72,0.13)] backdrop-blur-xl sm:px-6" aria-label="Негізгі навигация">
          <Link href="/" onClick={closeMenu} className={`${fredoka.className} relative z-10 text-[clamp(1.35rem,1rem+1vw,1.9rem)] tracking-[-0.04em] text-black`}>
            Geo<span className="rounded-md bg-[#dfff3f] px-1">Kenistik</span>
          </Link>

          <div className={`${isMenuOpen ? "flex" : "hidden"} absolute inset-inline-0 top-[calc(100%+10px)] flex-col rounded-[24px] border border-white bg-[#fffef8] p-4 shadow-2xl md:inset-inline-auto md:left-1/2 md:top-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2 md:flex-row md:items-center md:whitespace-nowrap md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            <Link href="/courses" className={navClass} onClick={closeMenu}>Курстар</Link>
            <Link href="/laboratory" className={navClass} onClick={closeMenu}>Зертхана</Link>
            <Link href="/profile" className={navClass} onClick={closeMenu}>Жеке кабинет</Link>
            {isAdmin ? <Link href="/admin" className={navClass} onClick={closeMenu}>Админ</Link> : null}

            <div className="mt-3 border-t border-black/10 pt-3 md:hidden">
              {!isPending && (user ? (
                <button onClick={handleLogout} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#dfff3f] px-5 text-sm font-black text-black"><LogOut className="h-4 w-4" />Шығу</button>
              ) : (
                <button onClick={handleSignIn} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#dfff3f] px-5 text-sm font-black text-black"><LogIn className="h-4 w-4" />Кіру</button>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!isPending && (user ? (
              <>
                <span className="max-w-36 truncate text-sm font-semibold text-slate-600" title={user.name || user.email}>{user.name || user.email}</span>
                <button onClick={handleLogout} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#dfff3f] px-5 text-sm font-black text-black transition hover:bg-[#d4f52f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff3f]/50"><LogOut className="h-4 w-4" />Шығу</button>
              </>
            ) : (
              <button onClick={handleSignIn} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#dfff3f] px-6 text-sm font-black text-black transition hover:bg-[#d4f52f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff3f]/50"><LogIn className="h-4 w-4" />Кіру</button>
            ))}
          </div>

          <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-label={isMenuOpen ? "Мәзірді жабу" : "Мәзірді ашу"} aria-expanded={isMenuOpen} className="relative z-10 grid h-11 w-11 place-items-center rounded-xl bg-black text-white md:hidden">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>
      {isMenuOpen ? <button type="button" aria-label="Мәзірді жабу" onClick={closeMenu} className="fixed inset-0 z-40 bg-[#20134a]/35 backdrop-blur-sm md:hidden" /> : null}
    </>
  );
}
