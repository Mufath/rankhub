import { getBoardBySlug, getParticipantsByBoardId, getAllBoards } from "@/lib/storage";
import { sortAndRankParticipants } from "@/lib/utils";
import { CardChaseLeaderboard } from "@/components/card-chase-leaderboard";

export default async function HomePage() {
  const allBoards = await getAllBoards();

  // Pick cardchase-pokemon as default if available, otherwise first board
  const activeBoard =
    (await getBoardBySlug("cardchase-pokemon")) ||
    allBoards[0] || {
      id: "board-cardchase",
      slug: "cardchase-pokemon",
      title: "CardChase Pokémon League",
      description: "Leaderboard prediksi harga kartu dan turnamen mingguan.",
      sortOrder: "DESC",
      unitType: "CUSTOM",
      customUnit: "XP",
      status: "ACTIVE",
      visibility: "PUBLIC",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  const rawParticipants = await getParticipantsByBoardId(activeBoard.id);
  const rankedParticipants = sortAndRankParticipants(rawParticipants, activeBoard.sortOrder);

  return (
    <main className="min-h-screen py-8 px-2 sm:px-4 flex items-center justify-center bg-[#ECE7D5] overflow-x-hidden">
      <CardChaseLeaderboard
        initialBoard={activeBoard}
        initialParticipants={rankedParticipants}
        allBoards={allBoards}
      />
    </main>
  );
}
