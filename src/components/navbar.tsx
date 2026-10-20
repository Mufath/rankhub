"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, ShieldCheck, Zap, Layers } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - Apple Style */}
        <Link href="/" className="flex items-center gap-3 select-none group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Rank<span className="text-amber-400 font-extrabold">Hub</span>
              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
              Universal Ranking & Auction Priority
            </p>
          </div>
        </Link>

        {/* Center Navigation Pills (Apple Segmented Style) */}
        <nav
          aria-label="Main Navigation"
          className="flex items-center bg-white/5 border border-white/10 p-1 rounded-full text-xs font-semibold text-slate-400 gap-1 shadow-inner"
        >
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-white/15 text-white shadow-sm font-bold"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Boards</span>
            <span className="sm:hidden">Boards</span>
          </Link>

          <Link
            href="/board/lelang-subsecond-w10"
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              pathname.includes("lelang-subsecond-w10")
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/25"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
            <span>SubSecond Auction</span>
          </Link>

          <Link
            href="/admin"
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              isAdmin
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
