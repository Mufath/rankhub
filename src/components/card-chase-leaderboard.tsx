"use client";

import { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  PlusCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { Board, Participant } from "@/types";
import { formatScore } from "@/lib/utils";
import { getParticipantAvatar } from "@/lib/avatar-helper";
import { SubmitBidModal } from "./submit-bid-modal";
import { ExportModal } from "./export-modal";

interface CardChaseLeaderboardProps {
  initialBoard: Board;
  initialParticipants: Participant[];
  allBoards?: Board[];
}

export function CardChaseLeaderboard({
  initialBoard,
  initialParticipants,
  allBoards = [],
}: CardChaseLeaderboardProps) {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [period, setPeriod] = useState<"weekly" | "alltime">("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Top 3 Podium Participants
  const top1 = participants[0];
  const top2 = participants[1];
  const top3 = participants[2];

  // Refresh live data from API
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/boards/${board.slug}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setBoard(json.data);
        setParticipants(json.data.participants || []);
      }
    } catch (err) {
      console.error("Failed to refresh board data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter participants by search
  const filteredParticipants = participants.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const meta = JSON.stringify(p.customMeta || {}).toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.identifier.toLowerCase().includes(q) ||
      meta.includes(q)
    );
  });

  const handleRowClick = (name: string, rank?: number) => {
    setSelectedPlayer(name);
    if (rank && rank <= 3) {
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
        particleCount: 75,
        spread: 85,
        origin: { y: 0.5 },
        colors: ["#F5CF46", "#FF9E1B", "#38BDF8", "#10B981"],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-8 px-3 sm:px-6">
      {/* =========================================================
          DECORATIVE 3D GRAPHIC: TOP LEFT (3D CARDS & POKEBALL)
          ========================================================= */}
      <div className="absolute -top-10 left-4 sm:left-10 z-30 pointer-events-none select-none flex items-center">
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
          MAIN CONTAINER: CARDCHASE DASHBOARD (SIDEBAR REMOVED)
          ========================================================= */}
      <main
        className="w-full bg-[#FAF6E9] rounded-[42px] md:rounded-[48px] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border border-white/80 p-6 sm:p-10 relative overflow-visible animate-entrance flex flex-col"
        data-purpose="leaderboard-container"
      >
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-2 border-b border-gray-200/60">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 select-none pl-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
              <i className="fa-solid fa-layer-group text-lg" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-gray-900 leading-none">
                Card<span className="text-[#E8890C] font-extrabold">Chase</span>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold tracking-wide">
                {board.title}
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex items-center bg-[#EFE9D2]/70 p-1.5 rounded-full text-xs font-semibold text-gray-600 gap-1 shadow-sm">
              {allBoards.length > 1 && (
                <div className="relative group">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-full hover:text-gray-900 hover:bg-white/50 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-table-cells-large text-gray-400" />
                    <span>Papan Lain</span>
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                    {allBoards.map((b) => (
                      <Link
                        key={b.id}
                        href={`/board/${b.slug}`}
                        className={`block px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          b.slug === board.slug
                            ? "bg-amber-100 text-amber-900"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {b.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="px-4 py-1.5 rounded-full bg-gray-900 text-white shadow-sm flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <i className="fa-solid fa-trophy text-amber-400 text-xs" />
                <span>Leaderboard</span>
              </button>

              <Link
                href="/admin"
                className="px-4 py-1.5 rounded-full hover:text-gray-900 hover:bg-white/50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-shield text-amber-500" />
                <span>Admin Panel</span>
              </Link>
            </nav>

            {/* Quick Action: Add Real Player / Submit Entry */}
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#E8890C] hover:bg-[#d47c09] text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Peserta</span>
            </button>
          </div>
        </header>

        {/* Filter Bar: Weekly / All time + Search + Live Actions */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3 pt-1">
          {/* Sliding Pill Switch */}
          <div className="flex items-center gap-2">
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

            {/* Refresh button */}
            <button
              type="button"
              onClick={refreshData}
              className="p-2 rounded-full bg-white/70 hover:bg-white border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors shadow-xs cursor-pointer"
              title="Perbarui data leaderboard"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`}
              />
            </button>

            {/* Export / API modal */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-white/70 hover:bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-amber-600" />
              <span>Ekspor</span>
            </button>
          </div>

          {/* Search Box & Top 1 Player Mini Chip */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white/70 focus-within:bg-white border border-gray-200/80 rounded-full px-3 py-1 shadow-xs transition-all">
              <i className="fa-solid fa-magnifying-glass text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Cari peserta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-gray-800 placeholder-gray-400 border-none outline-none focus:ring-0 p-0 w-24 sm:w-36"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {/* Top 1 Player Mini Chip */}
            {top1 && (
              <div
                onClick={triggerConfetti}
                className="flex items-center gap-2 bg-[#FAF2D4] border border-amber-200/60 pl-1.5 pr-3 py-1 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
                title="Puncak Klasemen (Klik untuk selebrasi)"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-400 border border-white flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  <img
                    alt={top1.name}
                    className="w-full h-full object-cover"
                    src={getParticipantAvatar(top1, 0)}
                  />
                </div>
                <div className="leading-tight text-left">
                  <div className="text-[11px] font-bold text-gray-900 truncate max-w-[90px]">
                    {top1.name}
                  </div>
                  <div className="text-[9px] font-semibold text-amber-700">
                    {formatScore(top1.value, board.unitType, board.customUnit)}
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px]">
                  <i className="fa-solid fa-crown text-[8px]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            3D STEPPED CYLINDRICAL PODIUM (REAL DATA)
            ========================================================= */}
        <section className="ambient-glow pt-2 pb-4 px-2 rounded-3xl relative">
          <div className="grid grid-cols-3 max-w-xl mx-auto items-end pt-4 pb-2">
            {/* 2nd Place: Medium Height ~ h-36 md:h-40 */}
            <div
              id="podium-card-2"
              onClick={() => top2 && handleRowClick(top2.name, 2)}
              className="podium-card flex flex-col items-center text-center z-10 -mr-3 relative cursor-pointer"
              data-player={top2?.name || "Rank 2"}
            >
              {top2 ? (
                <>
                  <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white rounded-2xl py-1.5 px-3 shadow-xl backdrop-blur-md z-40 whitespace-nowrap text-left border border-white/20">
                    <div className="text-[10px] text-sky-300 font-semibold uppercase tracking-wider">
                      Rank #2 • {(top2.customMeta as { deck?: string })?.deck || "Challenger"}
                    </div>
                    <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                      <span>Status: {top2.status}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-amber-400">
                        {formatScore(top2.value, board.unitType, board.customUnit)}
                      </span>
                    </div>
                  </div>

                  <div className="relative mb-2 flex flex-col items-center floating-anim-2">
                    <div className="avatar-ring w-18 h-18 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-b from-sky-200 to-blue-400 shadow-lg transition-transform">
                      <img
                        alt={top2.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                        src={getParticipantAvatar(top2, 1)}
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow">
                      <i className="fa-solid fa-water" />
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm md:text-base text-gray-900 tracking-tight truncate max-w-[120px]">
                    {top2.name}
                  </h3>
                  <span className="inline-block mt-1 bg-black text-white font-bold text-[11px] px-3 py-0.5 rounded-full shadow-md font-mono">
                    {formatScore(top2.value, board.unitType, board.customUnit)}
                  </span>

                  <div className="relative z-20 mt-3 -mb-5 flex justify-center">
                    <div className="w-12 h-12 medal-3d medal-3d-silver ribbon-silver flex items-center justify-center text-slate-700">
                      <i className="fa-solid fa-star text-base text-slate-600 drop-shadow-sm" />
                    </div>
                  </div>

                  <div className="relative w-full px-1">
                    <div className="cylinder-base w-full h-36 md:h-40">
                      <div className="cylinder-cap" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-36 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-3xl">
                  Posisi #2 Kosong
                </div>
              )}
            </div>

            {/* 1st Place: Center, Tallest ~ h-48 md:h-52 */}
            <div
              id="podium-card-1"
              onClick={() => {
                triggerConfetti();
                if (top1) handleRowClick(top1.name, 1);
              }}
              className="podium-card flex flex-col items-center text-center z-20 relative cursor-pointer"
              data-player={top1?.name || "Rank 1"}
            >
              {top1 ? (
                <>
                  <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white rounded-2xl py-1.5 px-3.5 shadow-xl backdrop-blur-md z-40 whitespace-nowrap text-left border border-amber-400/40">
                    <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                      Champion #1 • {(top1.customMeta as { deck?: string })?.deck || "Leader"}
                    </div>
                    <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                      <span>Status: {top1.status}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-amber-400">
                        {formatScore(top1.value, board.unitType, board.customUnit)}
                      </span>
                    </div>
                  </div>

                  <div className="relative mb-2 flex flex-col items-center floating-anim-1">
                    <div className="avatar-ring w-22 h-22 md:w-24 md:h-24 rounded-full p-1.5 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 shadow-xl ring-4 ring-amber-300/50 transition-transform">
                      <img
                        alt={top1.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                        src={getParticipantAvatar(top1, 0)}
                      />
                    </div>
                    <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow shimmer-active">
                      <i className="fa-solid fa-crown text-yellow-200" />
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base md:text-lg text-gray-900 tracking-tight truncate max-w-[140px]">
                    {top1.name}
                  </h3>
                  <span className="inline-block mt-1 bg-black text-amber-400 font-extrabold text-xs px-3.5 py-0.5 rounded-full shadow-md font-mono">
                    {formatScore(top1.value, board.unitType, board.customUnit)}
                  </span>

                  <div className="relative z-20 mt-3 -mb-6 flex justify-center shimmer-active">
                    <div className="w-14 h-14 medal-3d medal-3d-gold ribbon-gold flex items-center justify-center text-amber-900">
                      <i className="fa-solid fa-star text-xl text-amber-800 drop-shadow-sm" />
                    </div>
                  </div>

                  <div className="relative w-full px-0">
                    <div className="cylinder-base w-full h-48 md:h-52">
                      <div className="cylinder-cap" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-48 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-3xl">
                  Posisi #1 Kosong
                </div>
              )}
            </div>

            {/* 3rd Place: Shorter ~ h-28 md:h-32 */}
            <div
              id="podium-card-3"
              onClick={() => top3 && handleRowClick(top3.name, 3)}
              className="podium-card flex flex-col items-center text-center z-10 -ml-3 relative cursor-pointer"
              data-player={top3?.name || "Rank 3"}
            >
              {top3 ? (
                <>
                  <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white rounded-2xl py-1.5 px-3 shadow-xl backdrop-blur-md z-40 whitespace-nowrap text-left border border-orange-400/30">
                    <div className="text-[10px] text-orange-300 font-semibold uppercase tracking-wider">
                      Rank #3 • {(top3.customMeta as { deck?: string })?.deck || "Contender"}
                    </div>
                    <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                      <span>Status: {top3.status}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-amber-400">
                        {formatScore(top3.value, board.unitType, board.customUnit)}
                      </span>
                    </div>
                  </div>

                  <div className="relative mb-2 flex flex-col items-center floating-anim-3">
                    <div className="avatar-ring w-18 h-18 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-b from-orange-300 to-amber-700 shadow-lg transition-transform">
                      <img
                        alt={top3.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                        src={getParticipantAvatar(top3, 2)}
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-white text-[10px] shadow">
                      <i className="fa-solid fa-shield" />
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm md:text-base text-gray-900 tracking-tight truncate max-w-[120px]">
                    {top3.name}
                  </h3>
                  <span className="inline-block mt-1 bg-black text-white font-bold text-[11px] px-3 py-0.5 rounded-full shadow-md font-mono">
                    {formatScore(top3.value, board.unitType, board.customUnit)}
                  </span>

                  <div className="relative z-20 mt-3 -mb-5 flex justify-center">
                    <div className="w-12 h-12 medal-3d medal-3d-bronze ribbon-bronze flex items-center justify-center text-orange-950">
                      <i className="fa-solid fa-star text-base text-amber-950/80 drop-shadow-sm" />
                    </div>
                  </div>

                  <div className="relative w-full px-1">
                    <div className="cylinder-base w-full h-28 md:h-32">
                      <div className="cylinder-cap" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-28 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-3xl">
                  Posisi #3 Kosong
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================
            LEADERBOARD PILL ROWS (REAL DYNAMIC DATA)
            ========================================================= */}
        <section className="mt-3 space-y-2 relative z-10" id="leaderboard-list">
          {filteredParticipants.length === 0 ? (
            <div className="p-8 text-center bg-white/40 border border-gray-200/60 rounded-3xl text-gray-500 text-xs">
              Belum ada peserta yang cocok dengan filter pencarian.
            </div>
          ) : (
            filteredParticipants.map((p, index) => {
              const isSelected = selectedPlayer === p.name;
              const rank = p.rank || index + 1;
              const meta = p.customMeta as Record<string, unknown> | undefined;
              const deck = meta?.deck ? String(meta.deck) : `ID: ${p.identifier}`;
              const tier =
                rank <= 3
                  ? "Legendary Trainer"
                  : p.status === "VERIFIED"
                  ? "Pro Trainer"
                  : "Challenger";

              return (
                <article
                  key={p.id}
                  onClick={() => handleRowClick(p.name, rank)}
                  className={`ranking-pill-row rounded-full px-5 py-2.5 flex items-center justify-between cursor-pointer group transition-all ${
                    isSelected ? "ring-2 ring-amber-400 bg-white/95" : ""
                  }`}
                  data-name={p.name}
                  data-purpose="rank-row"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank Circle */}
                    <span
                      className={`w-7 h-7 shrink-0 rounded-full border text-gray-900 font-extrabold text-xs flex items-center justify-center shadow-xs transition-colors ${
                        rank === 1
                          ? "border-amber-400/90 bg-amber-100 text-amber-900"
                          : rank === 2
                          ? "border-blue-400/90 bg-sky-100 text-sky-900"
                          : rank === 3
                          ? "border-emerald-400/90 bg-emerald-100 text-emerald-900"
                          : "border-gray-400/80 bg-white/80"
                      }`}
                    >
                      {rank}
                    </span>

                    {/* Avatar & Element Badge */}
                    <div className="relative shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        alt={p.name}
                        className={`w-10 h-10 rounded-full object-cover border-2 ${
                          rank === 1
                            ? "border-amber-400"
                            : rank === 2
                            ? "border-blue-400"
                            : rank === 3
                            ? "border-emerald-400"
                            : "border-gray-200"
                        }`}
                        src={getParticipantAvatar(p, index)}
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${
                          rank === 1
                            ? "bg-amber-500"
                            : rank === 2
                            ? "bg-blue-500"
                            : rank === 3
                            ? "bg-emerald-600"
                            : "bg-orange-400"
                        } text-white text-[8px] flex items-center justify-center border border-white`}
                      >
                        <i
                          className={`fa-solid ${
                            rank === 1
                              ? "fa-crown"
                              : rank === 2
                              ? "fa-water"
                              : rank === 3
                              ? "fa-shield"
                              : "fa-bolt"
                          }`}
                        />
                      </span>
                    </div>

                    {/* Name & Deck Info */}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-amber-900 transition-colors truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium truncate">
                        {deck}
                      </p>
                    </div>
                  </div>

                  {/* Center: Tier Status Badge */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span
                      className={
                        tier === "Legendary Trainer" ? "text-amber-500" : "text-slate-400"
                      }
                    >
                      <i className="fa-solid fa-ribbon text-base" />
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        tier === "Legendary Trainer"
                          ? "text-gray-800"
                          : "text-gray-600 font-semibold"
                      }`}
                    >
                      {tier}
                    </span>
                    {p.status === "VERIFIED" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified" />
                    )}
                  </div>

                  {/* Right: Real Formatted Score */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-gray-900 group-hover:text-amber-700 transition-colors font-mono">
                      {formatScore(p.value, board.unitType, board.customUnit)}
                    </span>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>

      {/* =========================================================
          DECORATIVE 3D GRAPHIC: BOTTOM RIGHT (TRADING CARD & ARROWS)
          ========================================================= */}
      <div className="absolute -bottom-10 right-4 sm:right-12 z-30 pointer-events-none select-none flex items-center">
        <div className="relative w-32 h-36">
          {/* Red Down Arrow */}
          <div className="absolute top-10 -left-4 w-9 h-11 bg-red-600 rounded-lg shadow-lg flex items-center justify-center transform -rotate-12">
            <i className="fa-solid fa-arrow-down text-white text-lg font-black" />
          </div>

          {/* 3D Trading Card */}
          <div className="absolute top-0 right-2 w-24 h-32 rounded-2xl bg-gradient-to-br from-[#EFE8D0] via-[#E6DDBF] to-[#D5CBA8] shadow-2xl border-3 border-white/90 transform rotate-6 flex flex-col items-center justify-center p-2">
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

      {/* Submit / Add Real Entry Modal */}
      <SubmitBidModal
        board={board}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => refreshData()}
      />

      {/* Export / API Sync Modal */}
      <ExportModal
        board={{ ...board, participants }}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
