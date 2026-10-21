import fs from "fs";
import path from "path";
import { Board, Participant } from "@/types";
import { SEED_BOARDS, SEED_PARTICIPANTS } from "./seed-data";

interface StorageData {
  boards: Board[];
  participants: Participant[];
}

// In-memory cache to ensure speed and availability
let globalMemoryCache: StorageData | null = null;

function getStoreFilePath(): string {
  // Use /tmp in Vercel/serverless environments if standard dir is read-only
  const isVercel = process.env.VERCEL === "1";
  if (isVercel) {
    return path.join("/tmp", "rankhub-store.json");
  }
  return path.join(process.cwd(), ".data", "rankhub-store.json");
}

function ensureDataLoaded(): StorageData {
  if (globalMemoryCache) {
    return globalMemoryCache;
  }

  const filePath = getStoreFilePath();

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content) as StorageData;
      if (parsed && Array.isArray(parsed.boards) && Array.isArray(parsed.participants)) {
        // Ensure new seed boards (like cardchase-pokemon) are merged in if missing
        SEED_BOARDS.forEach((sb) => {
          if (!parsed.boards.some((b) => b.id === sb.id)) {
            parsed.boards.unshift(sb);
          }
        });
        SEED_PARTICIPANTS.forEach((sp) => {
          if (!parsed.participants.some((p) => p.id === sp.id)) {
            parsed.participants.push(sp);
          }
        });
        globalMemoryCache = parsed;
        persistData(parsed);
        return globalMemoryCache;
      }
    }
  } catch (err) {
    console.warn("Storage load warning (will fallback to seed):", err);
  }

  // Initialize with seed data
  globalMemoryCache = {
    boards: [...SEED_BOARDS],
    participants: [...SEED_PARTICIPANTS],
  };

  persistData(globalMemoryCache);
  return globalMemoryCache;
}

function persistData(data: StorageData): void {
  globalMemoryCache = data;
  try {
    const filePath = getStoreFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to storage file (using in-memory):", err);
  }
}

// --- Board Operations ---

export async function getAllBoards(): Promise<Board[]> {
  const store = ensureDataLoaded();
  return [...store.boards];
}

export async function getPublicBoards(): Promise<Board[]> {
  const store = ensureDataLoaded();
  return store.boards.filter((b) => b.visibility === "PUBLIC" && b.status !== "ARCHIVED");
}

export async function getBoardBySlug(slug: string): Promise<Board | null> {
  const store = ensureDataLoaded();
  const board = store.boards.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
  return board || null;
}

export async function getBoardById(id: string): Promise<Board | null> {
  const store = ensureDataLoaded();
  const board = store.boards.find((b) => b.id === id);
  return board || null;
}

export async function saveBoard(board: Board): Promise<Board> {
  const store = ensureDataLoaded();
  const index = store.boards.findIndex((b) => b.id === board.id);

  const updatedBoard: Board = {
    ...board,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    store.boards[index] = updatedBoard;
  } else {
    store.boards.push(updatedBoard);
  }

  persistData(store);
  return updatedBoard;
}

export async function deleteBoard(id: string): Promise<boolean> {
  const store = ensureDataLoaded();
  const initialLen = store.boards.length;
  store.boards = store.boards.filter((b) => b.id !== id);
  store.participants = store.participants.filter((p) => p.boardId !== id);

  persistData(store);
  return store.boards.length < initialLen;
}

// --- Participant Operations ---

export async function getParticipantsByBoardId(boardId: string): Promise<Participant[]> {
  const store = ensureDataLoaded();
  return store.participants.filter((p) => p.boardId === boardId);
}

export async function saveParticipant(participant: Participant): Promise<Participant> {
  const store = ensureDataLoaded();
  const index = store.participants.findIndex((p) => p.id === participant.id);

  const updatedParticipant: Participant = {
    ...participant,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    store.participants[index] = updatedParticipant;
  } else {
    store.participants.push(updatedParticipant);
  }

  persistData(store);
  return updatedParticipant;
}

export async function deleteParticipant(id: string): Promise<boolean> {
  const store = ensureDataLoaded();
  const initialLen = store.participants.length;
  store.participants = store.participants.filter((p) => p.id !== id);

  persistData(store);
  return store.participants.length < initialLen;
}

export async function resetDatabase(): Promise<void> {
  const data: StorageData = {
    boards: [...SEED_BOARDS],
    participants: [...SEED_PARTICIPANTS],
  };
  persistData(data);
}
