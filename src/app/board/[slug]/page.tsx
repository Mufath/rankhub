import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Download,
  PlusCircle,
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
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Papan</span>
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

          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono">
            {board.sortOrder === "DESC" ? "Urutan: Nilai Tertinggi" : "Urutan: Tercepat (ms)"}
          </span>
        </div>
      </div>

      {/* Main Board Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              /board/{board.slug}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {board.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {board.description}
            </p>
          </div>

          {/* Countdown Timer Block */}
          <div className="shrink-0 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
            <CountdownTimer deadline={board.deadline} status={board.status} />
          </div>
        </div>

        {/* Banner Notes / Disclaimer Alert */}
        {board.bannerNotes && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-amber-200/90 text-xs sm:text-sm leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Catatan & Aturan: </span>
              {board.bannerNotes}
            </div>
          </div>
        )}

        {/* Client Interactive Buttons (Export, Share, Submit Entry) */}
        <BoardClientControls board={boardWithParticipants} isLocked={isLocked} />
      </div>

      {/* Podium Top 3 */}
      {board.config?.enablePodium && rankedParticipants.length > 0 && (
        <Podium
          participants={rankedParticipants}
          unitType={board.unitType}
          customUnit={board.customUnit}
          isMasked={board.config?.maskIdentifiersByDefault ?? true}
        />
      )}

      {/* Leaderboard Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Papan Peringkat Lengkap
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {rankedParticipants.length} Entri
            </span>
          </div>

          <span className="text-xs text-slate-500">
            Realtime Rank Order
          </span>
        </div>

        <LeaderboardTable
          participants={rankedParticipants}
          unitType={board.unitType}
          customUnit={board.customUnit}
          defaultMasked={board.config?.maskIdentifiersByDefault ?? true}
        />
      </div>
    </div>
  );
}
