import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { getBoardBySlug, getParticipantsByBoardId } from "@/lib/storage";
import { sortAndRankParticipants } from "@/lib/utils";
import { CountdownTimer } from "@/components/countdown-timer";
import { Podium } from "@/components/podium";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { BoardClientControls } from "./board-client-controls";
import { BoardWithParticipants } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  if (!board) {
    return {
      title: "Board Tidak Ditemukan - RankHub",
    };
  }

  return {
    title: `${board.title} - RankHub Leaderboard`,
    description: board.description || "Universal Ranking & Leaderboard Platform",
  };
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  if (!board) {
    notFound();
  }

  const rawParticipants = await getParticipantsByBoardId(board.id);
  const rankedParticipants = sortAndRankParticipants(rawParticipants, board.sortOrder);

  const boardWithParticipants: BoardWithParticipants = {
    ...board,
    participants: rankedParticipants,
    stats: {
      totalParticipants: rankedParticipants.length,
      verifiedParticipants: rankedParticipants.filter((p) => p.status === "VERIFIED").length,
      pendingParticipants: rankedParticipants.filter((p) => p.status === "PENDING").length,
      topValue: rankedParticipants.length > 0 ? rankedParticipants[0].value : 0,
    },
  };

  const isLocked = board.status === "LOCKED" || board.status === "ARCHIVED";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Semua Papan</span>
        </Link>

        <div className="flex items-center gap-2">
          {board.status === "ACTIVE" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Lelang Aktif
            </span>
          ) : board.status === "LOCKED" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/70 text-rose-300 border border-rose-500/40">
              Lelang Dikunci (Final)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
              Diarsipkan
            </span>
          )}

          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono">
            {board.sortOrder === "DESC" ? "Urutan: Tertinggi (Rp)" : "Urutan: Tercepat (ms)"}
          </span>
        </div>
      </div>

      {/* =========================================================
          APPLE-STYLE MAIN LEADERBOARD CONTAINER
          ========================================================= */}
      <main
        className="w-full bg-[#0d121f]/90 border border-white/10 rounded-[38px] md:rounded-[46px] shadow-2xl p-6 sm:p-10 relative overflow-hidden animate-entrance backdrop-blur-2xl"
        data-purpose="leaderboard-container"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 ambient-glow pointer-events-none" />

        {/* Board Header Section */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-mono font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              /board/{board.slug}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {board.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {board.description}
            </p>
          </div>

          {/* Cutoff Countdown Timer */}
          <div className="shrink-0 p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/10 shadow-lg">
            <CountdownTimer deadline={board.deadline} status={board.status} />
          </div>
        </div>

        {/* Disclaimer / Banner Notes if any */}
        {board.bannerNotes && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Catatan: </span>
              {board.bannerNotes}
            </div>
          </div>
        )}

        {/* Client Interactive Action Buttons (Submit bid, share, export) */}
        <BoardClientControls board={boardWithParticipants} isLocked={isLocked} />

        {/* 3D Stepped Cylindrical Podium */}
        {board.config?.enablePodium && rankedParticipants.length > 0 && (
          <div className="mt-4">
            <Podium
              participants={rankedParticipants}
              unitType={board.unitType}
              customUnit={board.customUnit}
              isMasked={board.config?.maskIdentifiersByDefault ?? true}
            />
          </div>
        )}

        {/* Leaderboard Table & Ranking Pill Rows */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Daftar Klasemen Lengkap
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {rankedParticipants.length} Entri Terdaftar
            </span>
          </div>

          <LeaderboardTable
            participants={rankedParticipants}
            unitType={board.unitType}
            customUnit={board.customUnit}
            defaultMasked={board.config?.maskIdentifiersByDefault ?? true}
          />
        </div>
      </main>
    </div>
  );
}
