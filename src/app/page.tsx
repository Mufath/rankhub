import Link from "next/link";
import {
  Trophy,
  Zap,
  ArrowRight,
  Clock,
  Users,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";
import { getPublicBoards, getParticipantsByBoardId } from "@/lib/storage";
import { getTimeRemaining } from "@/lib/utils";

export default async function HomePage() {
  const boards = await getPublicBoards();

  // Fetch participant stats for each board
  const boardsWithStats = await Promise.all(
    boards.map(async (board) => {
      const participants = await getParticipantsByBoardId(board.id);
      const verifiedCount = participants.filter((p) => p.status === "VERIFIED").length;
      return {
        ...board,
        totalParticipants: participants.length,
        verifiedCount,
      };
    })
  );

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Universal Leaderboard & SubSecond Priority Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Papan Peringkat Modular &{" "}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
            SubSecond Priority Queue
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Platform leaderboard universal dengan desain Apple 3D cylindrical podium untuk lelang antrean bot SubSecond, turnamen pemrograman, dan voting.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/board/lelang-subsecond-w10"
            className="px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-xl shadow-amber-400/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Lihat Lelang SubSecond W10</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/admin"
            className="px-6 py-3 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Panel Admin</span>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-left">
          <div className="p-4 rounded-3xl glass-card border border-white/10">
            <span className="text-[11px] text-slate-400 block">Sorting Logic</span>
            <span className="text-xs font-bold text-white mt-0.5 block">
              Ascending & Descending
            </span>
          </div>
          <div className="p-4 rounded-3xl glass-card border border-white/10">
            <span className="text-[11px] text-slate-400 block">Unit Format</span>
            <span className="text-xs font-bold text-white mt-0.5 block">
              Rupiah, ms, Skor, Custom
            </span>
          </div>
          <div className="p-4 rounded-3xl glass-card border border-white/10">
            <span className="text-[11px] text-slate-400 block">Bot Sync</span>
            <span className="text-xs font-bold text-amber-400 mt-0.5 block">
              Cloudflare Worker Ready
            </span>
          </div>
          <div className="p-4 rounded-3xl glass-card border border-white/10">
            <span className="text-[11px] text-slate-400 block">Privasi Peserta</span>
            <span className="text-xs font-bold text-white mt-0.5 block">
              Sensor NIM Otomatis
            </span>
          </div>
        </div>
      </section>

      {/* Boards Directory */}
      <section className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Papan Peringkat Aktif
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih papan di bawah untuk melihat podium peringkat 3D atau berpartisipasi
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono">
            {boardsWithStats.length} Boards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {boardsWithStats.map((board) => {
            const time = board.deadline ? getTimeRemaining(board.deadline) : null;

            return (
              <div
                key={board.id}
                className="group p-6 rounded-[32px] glass-panel border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between relative overflow-hidden shadow-lg"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-amber-300">
                      /{board.slug}
                    </span>

                    {board.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/70 text-rose-300 border border-rose-500/30">
                        <Lock className="w-3 h-3 text-rose-400" />
                        LOCKED
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {board.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {board.description}
                    </p>
                  </div>

                  {/* Stats & Meta */}
                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Peserta</span>
                        <span className="font-bold text-slate-200">
                          {board.totalParticipants} ({board.verifiedCount} Lunas)
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Deadline</span>
                        <span className="font-bold text-slate-200">
                          {time ? (time.isExpired ? "Berakhir" : `${time.days}h ${time.hours}j`) : "Terbuka"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Format:{" "}
                    <span className="text-amber-400">
                      {board.unitType === "CURRENCY_IDR"
                        ? "Rupiah (Rp)"
                        : board.unitType === "MILLISECONDS"
                        ? "Milidetik (ms)"
                        : "Skor / Poin"}
                    </span>
                  </span>

                  <Link
                    href={`/board/${board.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group-hover:translate-x-1"
                  >
                    <span>Buka Podium</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
