"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, ShieldCheck, Zap, Layers, Wallet, Bolt } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - CardChase / RankHub Apple Style */}
        <Link href="/" className="flex items-center gap-2.5 select-none group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 text-yellow-200 fill-yellow-200" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Rank<span className="text-amber-400 font-extrabold">Hub</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">
              Universal Ranking & Auction Priority
            </p>
          </div>
        </Link>

        {/* Center Navigation Pills (Apple Style) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav
            aria-label="Main Navigation"
            className="flex items-center bg-white/5 border border-white/10 p-1 rounded-full text-xs font-semibold text-slate-400 gap-1 shadow-sm"
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
              <span>All Boards</span>
            </Link>

            <Link
              href="/board/lelang-subsecond-w10"
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                pathname.includes("lelang-subsecond-w10")
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                  : "hover:text-white hover:bg-white/5"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Leaderboard</span>
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

          {/* Balance Pill with mini dropdown popover (Apple Style) */}
          <div className="relative group hidden md:block">
            <div className="flex items-center gap-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 transition-colors">
              <span className="text-slate-400 text-[11px] font-medium">Balance</span>
              <span className="font-bold text-amber-300 font-mono">Rp 0</span>
              <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center ml-0.5">
                <Wallet className="w-3 h-3" />
              </div>
            </div>

            {/* Mini Popover Preview */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/15 p-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 transform group-hover:translate-y-0 translate-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                SubSecond Priority
              </div>
              <div className="flex items-center justify-between text-xs font-extrabold text-white mb-2">
                <span>0 ms Offset</span>
                <span className="text-emerald-400">Ready</span>
              </div>
              <Link
                href="/board/lelang-subsecond-w10"
                className="block text-center w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-xl transition-colors shadow-sm"
              >
                Ikuti Lelang
              </Link>
            </div>
          </div>

          {/* User Status Quick Badge (Alex Vance style) */}
          <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 pl-1.5 pr-3 py-1 rounded-full shadow-sm hover:border-white/20 transition-all cursor-pointer">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-400 border border-white flex items-center justify-center text-xs font-bold text-white shadow-sm">
              <img
                alt="Current User"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXrutjQj_k58Q2KW0RE0d2_yXg1B1LSQ3BEHokElkydTPEIdxWwa2zcKWIKKlhwBZ_HytCX03C88RgGri08_d3A0YamYzFSfQpexhfbf3hbc7ryuXsaz80HSDAbGMtTD0PT4x72lVyi0C9lbM1iW0l74tBJOzYgbxPZVDUZPdEF9Dbyokbtz8-dhqxLbt5_EO4OqtPKpTZvn9eTAS61ILww8Kdh8RYQn0FB6suZn3g51W4waZ37jP83w"
              />
            </div>
            <div className="leading-tight text-left">
              <div className="text-[11px] font-bold text-white leading-none">Alex Vance</div>
              <div className="text-[9px] font-semibold text-amber-400 leading-none">XP 5.000</div>
            </div>
            <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">
              <Bolt className="w-2.5 h-2.5 fill-slate-950" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
