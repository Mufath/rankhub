"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

interface Player {
  id: string;
  rank: number;
  name: string;
  deck: string;
  tier: "Legendary Trainer" | "Pro Trainer";
  xp: string;
  avatar: string;
  elementIcon: string;
  elementBg: string;
  winRate: string;
  wins: number;
}

const PLAYERS: Player[] = [
  {
    id: "p1",
    rank: 1,
    name: "Ash Ketchum",
    deck: "Charizard",
    tier: "Legendary Trainer",
    xp: "XP 5.000",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    elementIcon: "fa-crown",
    elementBg: "bg-amber-500",
    winRate: "89.2%",
    wins: 210,
  },
  {
    id: "p2",
    rank: 2,
    name: "Misty Kasumi",
    deck: "Blastoise",
    tier: "Legendary Trainer",
    xp: "XP 3.500",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80",
    elementIcon: "fa-water",
    elementBg: "bg-blue-500",
    winRate: "78.4%",
    wins: 142,
  },
  {
    id: "p3",
    rank: 3,
    name: "Brock Takeshi",
    deck: "Venusaur",
    tier: "Legendary Trainer",
    xp: "XP 2.200",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80",
    elementIcon: "fa-shield",
    elementBg: "bg-emerald-600",
    winRate: "72.0%",
    wins: 118,
  },
  {
    id: "p4",
    rank: 4,
    name: "Nick Jordan",
    deck: "Charizard",
    tier: "Pro Trainer",
    xp: "XP 2.100",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    elementIcon: "fa-bolt",
    elementBg: "bg-orange-400",
    winRate: "65.5%",
    wins: 94,
  },
  {
    id: "p5",
    rank: 5,
    name: "Naomi Watanabe",
    deck: "Blastoise",
    tier: "Pro Trainer",
    xp: "XP 1.800",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80",
    elementIcon: "fa-water",
    elementBg: "bg-cyan-500",
    winRate: "61.0%",
    wins: 82,
  },
  {
    id: "p6",
    rank: 6,
    name: "Sakura Haruno",
    deck: "Charizard",
    tier: "Pro Trainer",
    xp: "XP 1.500",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    elementIcon: "fa-leaf",
    elementBg: "bg-rose-400",
    winRate: "58.2%",
    wins: 70,
  },
];

export function CardChaseLeaderboard() {
  const [period, setPeriod] = useState<"weekly" | "alltime">("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const top1 = PLAYERS[0];
  const top2 = PLAYERS[1];
  const top3 = PLAYERS[2];

  const filteredPlayers = PLAYERS.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || p.deck.toLowerCase().includes(q);
  });

  const handleRowClick = (name: string, rank: number) => {
    setSelectedPlayer(name);
    if (rank <= 3) {
      const el = document.getElementById(`podium-card-${rank}`);
      if (el) {
        el.classList.add("-translate-y-3");
        setTimeout(() => el.classList.remove("-translate-y-3"), 600);
      }
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#F5CF46", "#FF9E1B", "#38BDF8", "#10B981"],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* =========================================================
          DECORATIVE 3D GRAPHIC: TOP LEFT (CARDS & POKEBALL)
          ========================================================= */}
      <div className="absolute -top-10 left-6 sm:left-12 z-30 pointer-events-none select-none flex items-center">
        {/* Fan of 3D Cards */}
        <div className="relative w-28 h-28">
          {/* Fire Card (Orange/Yellow) */}
          <div className="absolute top-2 left-2 w-16 h-22 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-xl border-2 border-white/90 transform -rotate-12 flex flex-col items-center justify-center p-1.5">
            <i className="fa-solid fa-fire text-white text-lg drop-shadow" />
            <div className="w-8 h-1 bg-white/40 rounded-full mt-2" />
          </div>
          {/* Water Card (Blue) */}
          <div className="absolute top-0 left-9 w-16 h-22 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-xl border-2 border-white/90 transform rotate-12 flex flex-col items-center justify-center p-1.5">
            <i className="fa-solid fa-droplet text-white text-lg drop-shadow" />
            <div className="w-8 h-1 bg-white/40 rounded-full mt-2" />
          </div>
          {/* 3D Pokeball resting on cards */}
          <div className="absolute top-8 left-6 w-16 h-16 rounded-full bg-white shadow-2xl border-2 border-slate-900/10 overflow-hidden flex flex-col transform hover:scale-105 transition-transform">
            <div className="w-full h-1/2 bg-gradient-to-b from-red-500 to-red-600 border-b-2 border-slate-900/80" />
            <div className="w-full h-1/2 bg-white" />
            {/* Center Pokeball Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-3 border-slate-900 flex items-center justify-center shadow">
              <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN CONTAINER: CARDCHASE DASHBOARD (WARM CREAM PALETTE)
          ========================================================= */}
      <main
        className="w-full bg-[#FAF6E9] rounded-[42px] md:rounded-[48px] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border border-white/80 p-6 md:p-10 relative overflow-visible animate-entrance flex flex-col lg:flex-row gap-8"
        data-purpose="leaderboard-container"
      >
        {/* =========================================================
            LEFT COLUMN: HEADER, PODIUM, LEADERBOARD LIST
            ========================================================= */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Top Header */}
          <header className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-2 select-none group cursor-pointer pl-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <i className="fa-solid fa-layer-group text-lg" />
              </div>
              <div className="text-2xl font-black tracking-tight text-gray-900">
                Card<span className="text-[#E8890C] font-extrabold">Chase</span>
              </div>
            </div>

            {/* Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <nav className="flex items-center bg-[#EFE9D2]/70 p-1.5 rounded-full text-xs font-semibold text-gray-600 gap-1 shadow-sm">
                <button
                  type="button"
                  className="px-4 py-2 rounded-full hover:text-gray-900 hover:bg-white/50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-table-cells-large text-gray-400" />
                  <span className="hidden sm:inline">Cards List</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full hover:text-gray-900 hover:bg-white/50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-right-arrow-left text-gray-400" />
                  <span className="hidden sm:inline">Swipe</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full bg-gray-900 text-white shadow-sm flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <i className="fa-solid fa-trophy text-amber-400 text-xs" />
                  <span>Leaderboard</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-full hover:text-gray-900 hover:bg-white/50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-regular fa-user text-gray-400" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
              </nav>

              {/* Balance Pill */}
              <div className="flex items-center gap-2 bg-[#F5EFCF] hover:bg-[#F2E9BE] cursor-pointer px-4 py-2 rounded-full text-xs font-semibold text-gray-700 shadow-inner transition-colors">
                <span className="text-gray-500 text-[11px] font-medium">Balance</span>
                <span className="font-bold text-gray-900 font-mono">$ 0.00</span>
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-700 flex items-center justify-center ml-0.5">
                  <i className="fa-solid fa-wallet text-[10px]" />
                </div>
              </div>
            </div>
          </header>

          {/* Filter Bar: Weekly/All Time Pill + Search + Mini User Chip */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2 pt-1">
            {/* Sliding Pill Switch */}
            <div className="relative bg-[#ECE4C7] p-1 rounded-full flex text-xs font-bold text-gray-600 shadow-inner">
              <button
                type="button"
                onClick={() => setPeriod("weekly")}
                className={`relative z-10 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  period === "weekly"
                    ? "bg-[#FFDE32] text-gray-900 font-bold shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setPeriod("alltime")}
                className={`relative z-10 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  period === "alltime"
                    ? "bg-[#FFDE32] text-gray-900 font-bold shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All time
              </button>
            </div>

            {/* Right side: Mini User Chip */}
            <div className="flex items-center gap-2.5 bg-[#FAF2D4] border border-amber-200/60 pl-1.5 pr-3 py-1 rounded-full shadow-sm hover:shadow transition-all cursor-pointer">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-amber-400 border border-white flex items-center justify-center text-xs font-bold text-white shadow-sm">
                <img
                  alt="Ash Ketchum"
                  className="w-full h-full object-cover"
                  src={top1.avatar}
                />
              </div>
              <div className="leading-tight text-left">
                <div className="text-[11px] font-bold text-gray-900">Ash Ketchum</div>
                <div className="text-[10px] font-semibold text-amber-700">XP 5.000</div>
              </div>
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                <i className="fa-solid fa-bolt" />
              </div>
            </div>
          </div>

          {/* =========================================================
              3D STEPPED CYLINDRICAL PODIUM
              ========================================================= */}
          <section className="ambient-glow pt-2 pb-4 px-2 rounded-3xl relative">
            <div className="grid grid-cols-3 max-w-xl mx-auto items-end pt-4 pb-2">
              {/* 2nd Place: Misty Kasumi (Left, Medium Height: h-36 md:h-40) */}
              <div
                id="podium-card-2"
                onClick={() => handleRowClick(top2.name, 2)}
                className="podium-card flex flex-col items-center text-center z-10 -mr-3 relative cursor-pointer"
                data-player={top2.name}
              >
                {/* Tooltip */}
                <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white rounded-2xl py-1.5 px-3 shadow-xl backdrop-blur-md z-40 whitespace-nowrap text-left border border-white/20">
                  <div className="text-[10px] text-sky-300 font-semibold uppercase tracking-wider">
                    Rank #2 • Oceanic Surge
                  </div>
                  <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                    <span>Win Rate: {top2.winRate}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-amber-400">{top2.wins} Wins</span>
                  </div>
                </div>

                {/* Avatar with Ring & Floating Animation */}
                <div className="relative mb-2 flex flex-col items-center floating-anim-2">
                  <div className="avatar-ring w-18 h-18 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-b from-sky-200 to-blue-400 shadow-lg transition-transform">
                    <img
                      alt={top2.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      src={top2.avatar}
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow">
                    <i className="fa-solid fa-water" />
                  </span>
                </div>

                {/* Name & XP Capsule */}
                <h3 className="font-extrabold text-sm md:text-base text-gray-900 tracking-tight">
                  {top2.name}
                </h3>
                <span className="inline-block mt-1 bg-black text-white font-bold text-[11px] px-3 py-0.5 rounded-full shadow-md">
                  {top2.xp}
                </span>

                {/* 3D Silver Medal */}
                <div className="relative z-20 mt-3 -mb-5 flex justify-center">
                  <div className="w-12 h-12 medal-3d medal-3d-silver ribbon-silver flex items-center justify-center text-slate-700">
                    <i className="fa-solid fa-star text-base text-slate-600 drop-shadow-sm" />
                  </div>
                </div>

                {/* 3D Cylindrical Pedestal */}
                <div className="relative w-full px-1">
                  <div className="cylinder-base w-full h-36 md:h-40">
                    <div className="cylinder-cap" />
                  </div>
                </div>
              </div>

              {/* 1st Place: Ash Ketchum (Center, Tallest: h-48 md:h-52) */}
              <div
                id="podium-card-1"
                onClick={() => {
                  triggerConfetti();
                  handleRowClick(top1.name, 1);
                }}
                className="podium-card flex flex-col items-center text-center z-20 relative cursor-pointer"
                data-player={top1.name}
              >
                {/* Tooltip */}
                <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white rounded-2xl py-1.5 px-3.5 shadow-xl backdrop-blur-md z-40 whitespace-nowrap text-left border border-amber-400/40">
                  <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                    Champion #1 • Apex Dragon
                  </div>
                  <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                    <span>Win Rate: {top1.winRate}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-amber-400">{top1.wins} Wins</span>
                  </div>
                </div>

                {/* Avatar with Ring & Shimmer/Float */}
                <div className="relative mb-2 flex flex-col items-center floating-anim-1">
                  <div className="avatar-ring w-22 h-22 md:w-24 md:h-24 rounded-full p-1.5 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 shadow-xl ring-4 ring-amber-300/50 transition-transform">
                    <img
                      alt={top1.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      src={top1.avatar}
                    />
                  </div>
                  <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow shimmer-active">
                    <i className="fa-solid fa-crown text-yellow-200" />
                  </span>
                </div>

                {/* Name & XP Capsule */}
                <h3 className="font-extrabold text-base md:text-lg text-gray-900 tracking-tight">
                  {top1.name}
                </h3>
                <span className="inline-block mt-1 bg-black text-amber-400 font-extrabold text-xs px-3.5 py-0.5 rounded-full shadow-md">
                  {top1.xp}
                </span>

                {/* 3D Gold Medal */}
                <div className="relative z-20 mt-3 -mb-6 flex justify-center shimmer-active">
                  <div className="w-14 h-14 medal-3d medal-3d-gold ribbon-gold flex items-center justify-center text-amber-900">
                    <i className="fa-solid fa-star text-xl text-amber-800 drop-shadow-sm" />
                  </div>
                </div>

                {/* 3D Cylindrical Pedestal */}
                <div className="relative w-full px-0">
                  <div className="cylinder-base w-full h-48 md:h-52">
                    <div className="cylinder-cap" />
                  </div>
                </div>
              </div>

              {/* 3rd Place: Brock Takeshi (Right, Shorter: h-28 md:h-32) */}
              <div
                id="podium-card-3"
                onClick={() => handleRowClick(top3.name, 3)}
                className="podium-card flex flex-col items-center text-center z-10 -ml-3 relative cursor-pointer"
                data-player={top3.name}
              >
                {/* Tooltip */}
                <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white rounded-2xl py-1.5 px-3 shadow-xl backdrop-blur-md z-40 whitespace-nowrap text-left border border-orange-400/30">
                  <div className="text-[10px] text-orange-300 font-semibold uppercase tracking-wider">
                    Rank #3 • Terra Titan
                  </div>
                  <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                    <span>Win Rate: {top3.winRate}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-amber-400">{top3.wins} Wins</span>
                  </div>
                </div>

                {/* Avatar with Ring & Floating Animation */}
                <div className="relative mb-2 flex flex-col items-center floating-anim-3">
                  <div className="avatar-ring w-18 h-18 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-b from-orange-300 to-amber-700 shadow-lg transition-transform">
                    <img
                      alt={top3.name}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      src={top3.avatar}
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-white text-[10px] shadow">
                    <i className="fa-solid fa-shield" />
                  </span>
                </div>

                {/* Name & XP Capsule */}
                <h3 className="font-extrabold text-sm md:text-base text-gray-900 tracking-tight">
                  {top3.name}
                </h3>
                <span className="inline-block mt-1 bg-black text-white font-bold text-[11px] px-3 py-0.5 rounded-full shadow-md">
                  {top3.xp}
                </span>

                {/* 3D Bronze Medal */}
                <div className="relative z-20 mt-3 -mb-5 flex justify-center">
                  <div className="w-12 h-12 medal-3d medal-3d-bronze ribbon-bronze flex items-center justify-center text-orange-950">
                    <i className="fa-solid fa-star text-base text-amber-950/80 drop-shadow-sm" />
                  </div>
                </div>

                {/* 3D Cylindrical Pedestal */}
                <div className="relative w-full px-1">
                  <div className="cylinder-base w-full h-28 md:h-32">
                    <div className="cylinder-cap" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              LEADERBOARD PILL ROWS (SEMI-TRANSLUCENT GLASS)
              ========================================================= */}
          <section className="mt-3 space-y-2 relative z-10" id="leaderboard-list">
            {filteredPlayers.map((p) => {
              const isSelected = selectedPlayer === p.name;
              return (
                <article
                  key={p.id}
                  onClick={() => handleRowClick(p.name, p.rank)}
                  className={`ranking-pill-row rounded-full px-5 py-2.5 flex items-center justify-between cursor-pointer group transition-all ${
                    isSelected ? "ring-2 ring-amber-400 bg-white/95" : ""
                  }`}
                  data-name={p.name}
                  data-purpose="rank-row"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank Number Circle */}
                    <span
                      className={`w-7 h-7 shrink-0 rounded-full border text-gray-900 font-extrabold text-xs flex items-center justify-center shadow-xs transition-colors ${
                        p.rank === 1
                          ? "border-amber-400/90 bg-amber-100 text-amber-900"
                          : p.rank === 2
                          ? "border-blue-400/90 bg-sky-100 text-sky-900"
                          : p.rank === 3
                          ? "border-emerald-400/90 bg-emerald-100 text-emerald-900"
                          : "border-gray-400/80 bg-white/80"
                      }`}
                    >
                      {p.rank}
                    </span>

                    {/* Avatar & Element Badge */}
                    <div className="relative shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        alt={p.name}
                        className={`w-10 h-10 rounded-full object-cover border-2 ${
                          p.rank === 1
                            ? "border-amber-400"
                            : p.rank === 2
                            ? "border-blue-400"
                            : p.rank === 3
                            ? "border-emerald-400"
                            : "border-gray-200"
                        }`}
                        src={p.avatar}
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${p.elementBg} text-white text-[8px] flex items-center justify-center border border-white`}
                      >
                        <i className={`fa-solid ${p.elementIcon}`} />
                      </span>
                    </div>

                    {/* Name & Deck Info */}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-amber-900 transition-colors truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium truncate">
                        {p.deck}
                      </p>
                    </div>
                  </div>

                  {/* Center: Tier Status Badge */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span
                      className={
                        p.tier === "Legendary Trainer" ? "text-amber-500" : "text-slate-400"
                      }
                    >
                      <i className="fa-solid fa-ribbon text-base" />
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        p.tier === "Legendary Trainer" ? "text-gray-800" : "text-gray-600 font-semibold"
                      }`}
                    >
                      {p.tier}
                    </span>
                  </div>

                  {/* Right: XP Points */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-gray-900 group-hover:text-amber-700 transition-colors font-mono">
                      {p.xp}
                    </span>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        {/* =========================================================
            RIGHT COLUMN: ASH KETCHUM USER PROFILE & GUIDE ROADMAP
            ========================================================= */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
          <div className="bg-white/95 rounded-[32px] p-6 shadow-sm border border-white/80 flex flex-col gap-6">
            {/* Top User Profile */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-md">
                  <img
                    alt="Ash Ketchum"
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                    src={top1.avatar}
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 text-[10px]">
                  <i className="fa-solid fa-camera" />
                </div>
              </div>
              <h3 className="font-extrabold text-base text-gray-900 tracking-tight">
                Ash Ketchum
              </h3>
              <p className="text-xs text-gray-400 font-medium">genovefa@gmail.com</p>
            </div>

            {/* Step-by-Step Guide Roadmap with Vertical Dotted Line */}
            <div className="space-y-5 relative">
              {/* Vertical Dotted Line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-gray-200 z-0" />

              {/* Step 1: Predict Card Prices */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-red-50 border-2 border-white shadow-sm flex items-center justify-center shrink-0 text-red-500">
                  <i className="fa-solid fa-circle-dot text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Predict Card Prices</h4>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    New Pokémon card markets go live daily. Predict if prices go up or down.
                  </p>
                </div>
              </div>

              {/* Step 2: Place Your Bet */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-gray-900 border-2 border-white shadow-sm flex items-center justify-center shrink-0 text-amber-400">
                  <i className="fa-solid fa-chart-line text-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Place Your Bet</h4>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Bet as little as $1 USDC. Go head-to-head with the crowd!
                  </p>
                </div>
              </div>

              {/* Step 3: Win & Earn */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-white shadow-sm flex items-center justify-center shrink-0 text-amber-500">
                  <i className="fa-solid fa-trophy text-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Win & Earn</h4>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Winners split the pool. Earn XP, level up, and evolve your Pokémon!
                  </p>
                </div>
              </div>

              {/* Step 4: Spend & Collect */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-orange-50 border-2 border-white shadow-sm flex items-center justify-center shrink-0 text-orange-500">
                  <i className="fa-solid fa-layer-group text-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Spend & Collect</h4>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    Use $CARD tokens in weekly raffles to win real collectible cards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================
          DECORATIVE 3D GRAPHIC: BOTTOM RIGHT (TRADING CARD & POKEBALL)
          ========================================================= */}
      <div className="absolute -bottom-10 right-6 sm:right-16 z-30 pointer-events-none select-none flex items-center">
        <div className="relative w-32 h-36">
          {/* Red Down Arrow */}
          <div className="absolute top-10 -left-4 w-9 h-11 bg-red-600 rounded-lg shadow-lg flex items-center justify-center transform -rotate-12">
            <i className="fa-solid fa-arrow-down text-white text-lg font-black" />
          </div>

          {/* 3D Trading Card (Beige/Sand Texture) */}
          <div className="absolute top-0 right-2 w-24 h-32 rounded-2xl bg-gradient-to-br from-[#EFE8D0] via-[#E6DDBF] to-[#D5CBA8] shadow-2xl border-3 border-white/90 transform rotate-6 flex flex-col items-center justify-center p-2">
            {/* Center Pokeball on card */}
            <div className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-slate-900/20 overflow-hidden flex flex-col relative">
              <div className="w-full h-1/2 bg-gradient-to-b from-red-500 to-red-600 border-b-2 border-slate-900/80" />
              <div className="w-full h-1/2 bg-white" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shadow">
                <div className="w-2 h-2 rounded-full bg-white border border-slate-400" />
              </div>
            </div>
          </div>

          {/* Black Up Arrow */}
          <div className="absolute top-8 -right-2 w-9 h-11 bg-slate-900 rounded-lg shadow-lg flex items-center justify-center transform rotate-12">
            <i className="fa-solid fa-arrow-up text-white text-lg font-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
