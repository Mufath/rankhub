"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, ShieldCheck, Zap, Layers } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Rank<span className="text-cyan-400">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">
              Universal Leaderboard & Priority Queue
            </p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-slate-800 text-cyan-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">All Boards</span>
          </Link>

          <Link
            href="/board/lelang-subsecond-w10"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname.includes("lelang-subsecond-w10")
                ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50"
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">SubSecond Auction</span>
            <span className="sm:hidden">Lelang</span>
          </Link>

          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isAdmin
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
