import Link from "next/link";
import { getBoardBySlug, getParticipantsByBoardId, getAllBoards } from "@/lib/storage";
import { sortAndRankParticipants } from "@/lib/utils";
import { RankHubLeaderboard } from "@/components/rankhub-leaderboard";
import { Shield, PlusCircle, Trophy } from "lucide-react";

export default async function HomePage() {
  const allBoards = await getAllBoards();

  // If no boards exist yet (clean production database)
  if (!allBoards || allBoards.length === 0) {
    return (
      <main className="min-h-screen py-8 sm:py-16 px-4 flex flex-col items-center justify-center bg-[#ECE7D5]">
        <div className="w-full max-w-lg bg-[#FAF6E9] rounded-[40px] shadow-[0_25px_65px_rgba(0,0,0,0.08)] border border-white/80 p-8 sm:p-12 text-center animate-entrance">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 mx-auto mb-6">
            <Trophy className="w-8 h-8 text-white" />
          </div>

          <div className="text-3xl font-black tracking-tight text-gray-900 mb-2">
            Rank<span className="text-[#E8890C] font-extrabold">Hub</span>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Belum Ada Papan Peringkat Aktif
          </h2>

          <p className="text-xs text-gray-600 font-medium leading-relaxed mb-8">
            Database Anda bersih dan siap digunakan. Silakan masuk ke Admin Console untuk membuat papan lelang prioritas bot, turnamen, atau antrean pertama Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/admin"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold bg-[#E8890C] hover:bg-[#d47c09] text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Papan Pertama</span>
            </Link>
            <Link
              href="/admin"
              className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-gray-700 border border-gray-200/80 shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Flagship default board: lelang-subsecond-w10 or first board in database
  const activeBoard =
    (await getBoardBySlug("lelang-subsecond-w10")) || allBoards[0];

  const rawParticipants = await getParticipantsByBoardId(activeBoard.id);
  const rankedParticipants = sortAndRankParticipants(rawParticipants, activeBoard.sortOrder);

  return (
    <main className="min-h-screen py-3 sm:py-6 px-1.5 sm:px-3 lg:px-4 flex flex-col items-center justify-start bg-[#ECE7D5] overflow-x-hidden">
      <RankHubLeaderboard
        initialBoard={activeBoard}
        initialParticipants={rankedParticipants}
        allBoards={allBoards}
      />
    </main>
  );
}
