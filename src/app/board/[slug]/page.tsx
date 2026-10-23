import { notFound } from "next/navigation";
import { getBoardBySlug, getParticipantsByBoardId, getAllBoards } from "@/lib/storage";
import { sortAndRankParticipants } from "@/lib/utils";
import { RankHubLeaderboard } from "@/components/rankhub-leaderboard";

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

  const allBoards = await getAllBoards();
  const rawParticipants = await getParticipantsByBoardId(board.id);
  const rankedParticipants = sortAndRankParticipants(rawParticipants, board.sortOrder);

  return (
    <main className="min-h-screen py-3 sm:py-6 px-1.5 sm:px-3 lg:px-4 flex flex-col items-center justify-start bg-[#ECE7D5] overflow-x-hidden">
      <RankHubLeaderboard
        initialBoard={board}
        initialParticipants={rankedParticipants}
        allBoards={allBoards}
      />
    </main>
  );
}
