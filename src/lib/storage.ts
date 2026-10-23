import fs from "fs";
import path from "path";
import { Board, Participant, BoardConfig } from "@/types";
import { SEED_BOARDS, SEED_PARTICIPANTS } from "./seed-data";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

interface StorageData {
  boards: Board[];
  participants: Participant[];
}

// In-memory cache to ensure sub-millisecond read access & local fallback
let globalMemoryCache: StorageData | null = null;

function getStoreFilePath(): string {
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
        globalMemoryCache = parsed;
        return globalMemoryCache;
      }
    }
  } catch (err) {
    console.warn("Storage load warning (fallback to empty):", err);
  }

  // Only load seed dummy data if explicitly requested via SEED_DEMO_DATA=true,
  // or in local offline development when neither Supabase nor store file exists.
  const shouldSeed =
    process.env.SEED_DEMO_DATA === "true" ||
    (process.env.NODE_ENV !== "production" && !isSupabaseConfigured());

  globalMemoryCache = {
    boards: shouldSeed ? [...SEED_BOARDS] : [],
    participants: shouldSeed ? [...SEED_PARTICIPANTS] : [],
  };

  persistLocalData(globalMemoryCache);
  return globalMemoryCache;
}

function persistLocalData(data: StorageData): void {
  globalMemoryCache = data;
  try {
    const filePath = getStoreFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to local storage file (using memory):", err);
  }
}

// --- Data Mappers between Supabase (snake_case) & RankHub (camelCase) ---

interface SupabaseBoardRow {
  id: string;
  slug: string;
  title: string;
  description?: string;
  banner_notes?: string;
  sort_order: 'DESC' | 'ASC';
  unit_type: 'CURRENCY_IDR' | 'SCORE' | 'MILLISECONDS' | 'CUSTOM';
  custom_unit?: string;
  status: 'ACTIVE' | 'LOCKED' | 'ARCHIVED';
  deadline?: string | null;
  visibility: 'PUBLIC' | 'UNLISTED';
  config?: BoardConfig;
  created_at: string;
  updated_at: string;
}

interface SupabaseParticipantRow {
  id: string;
  board_id: string;
  name: string;
  identifier: string;
  value: number | string;
  status: 'PENDING' | 'VERIFIED' | 'DISQUALIFIED';
  custom_meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function rowToBoard(row: SupabaseBoardRow): Board {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    bannerNotes: row.banner_notes,
    sortOrder: row.sort_order || "DESC",
    unitType: row.unit_type || "CURRENCY_IDR",
    customUnit: row.custom_unit,
    status: row.status || "ACTIVE",
    deadline: row.deadline,
    visibility: row.visibility || "PUBLIC",
    config: row.config || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function boardToRow(b: Board): SupabaseBoardRow {
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    description: b.description,
    banner_notes: b.bannerNotes,
    sort_order: b.sortOrder,
    unit_type: b.unitType,
    custom_unit: b.customUnit,
    status: b.status,
    deadline: b.deadline,
    visibility: b.visibility,
    config: b.config,
    created_at: b.createdAt,
    updated_at: b.updatedAt,
  };
}

function rowToParticipant(row: SupabaseParticipantRow): Participant {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    identifier: row.identifier,
    value: Number(row.value) || 0,
    status: row.status || "VERIFIED",
    customMeta: row.custom_meta || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function participantToRow(p: Participant): SupabaseParticipantRow {
  return {
    id: p.id,
    board_id: p.boardId,
    name: p.name,
    identifier: p.identifier,
    value: p.value,
    status: p.status,
    custom_meta: p.customMeta,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

// --- Board Operations ---

export async function getAllBoards(): Promise<Board[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return (data as SupabaseBoardRow[]).map(rowToBoard);
      }
    } catch (err) {
      console.warn("Supabase getAllBoards failed, fallback to local:", err);
    }
  }

  const store = ensureDataLoaded();
  return [...store.boards];
}

export async function getPublicBoards(): Promise<Board[]> {
  const boards = await getAllBoards();
  return boards.filter((b) => b.visibility === "PUBLIC" && b.status !== "ARCHIVED");
}

export async function getBoardBySlug(slug: string): Promise<Board | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .ilike("slug", slug.toLowerCase())
        .maybeSingle();
      if (!error && data) {
        return rowToBoard(data as SupabaseBoardRow);
      }
    } catch (err) {
      console.warn("Supabase getBoardBySlug failed, fallback to local:", err);
    }
  }

  const store = ensureDataLoaded();
  const board = store.boards.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
  return board || null;
}

export async function getBoardById(id: string): Promise<Board | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        return rowToBoard(data as SupabaseBoardRow);
      }
    } catch (err) {
      console.warn("Supabase getBoardById failed, fallback to local:", err);
    }
  }

  const store = ensureDataLoaded();
  const board = store.boards.find((b) => b.id === id);
  return board || null;
}

export async function saveBoard(board: Board): Promise<Board> {
  const updatedBoard: Board = {
    ...board,
    updatedAt: new Date().toISOString(),
  };

  // Sync to Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("boards").upsert(boardToRow(updatedBoard));
      if (error) {
        console.error("Supabase saveBoard error:", error.message, error.details);
      }
    } catch (err) {
      console.warn("Supabase saveBoard failed:", err);
    }
  }

  // Also update local cache
  const store = ensureDataLoaded();
  const index = store.boards.findIndex((b) => b.id === board.id);
  if (index >= 0) {
    store.boards[index] = updatedBoard;
  } else {
    store.boards.push(updatedBoard);
  }
  persistLocalData(store);

  return updatedBoard;
}

export async function deleteBoard(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("boards").delete().eq("id", id);
      if (error) {
        console.error("Supabase deleteBoard error:", error.message, error.details);
      }
    } catch (err) {
      console.warn("Supabase deleteBoard failed:", err);
    }
  }

  const store = ensureDataLoaded();
  const initialLen = store.boards.length;
  store.boards = store.boards.filter((b) => b.id !== id);
  store.participants = store.participants.filter((p) => p.boardId !== id);
  persistLocalData(store);

  return store.boards.length < initialLen;
}

// --- Participant Operations ---

export async function getParticipantsByBoardId(boardId: string): Promise<Participant[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("board_id", boardId);
      if (!error && data) {
        return (data as SupabaseParticipantRow[]).map(rowToParticipant);
      }
    } catch (err) {
      console.warn("Supabase getParticipants failed, fallback to local:", err);
    }
  }

  const store = ensureDataLoaded();
  return store.participants.filter((p) => p.boardId === boardId);
}

export async function saveParticipant(
  participant: Participant,
  options?: { previousValue?: number }
): Promise<Participant> {
  const updatedParticipant: Participant = {
    ...participant,
    updatedAt: new Date().toISOString(),
  };

  // Sync to Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("participants").upsert(participantToRow(updatedParticipant));
      if (error) {
        console.error("Supabase saveParticipant error:", error.message, error.details);
      }

      // Point 1: Record to bid_history table for auction audit trail
      if (options?.previousValue !== undefined && options.previousValue !== participant.value) {
        await supabase.from("bid_history").insert({
          board_id: participant.boardId,
          participant_id: participant.id,
          participant_name: participant.name,
          previous_value: options.previousValue,
          new_value: participant.value,
          difference: participant.value - options.previousValue,
        });
      }
    } catch (err) {
      console.warn("Supabase saveParticipant failed:", err);
    }
  }

  // Also update local cache
  const store = ensureDataLoaded();
  const index = store.participants.findIndex((p) => p.id === participant.id);
  if (index >= 0) {
    store.participants[index] = updatedParticipant;
  } else {
    store.participants.push(updatedParticipant);
  }
  persistLocalData(store);

  return updatedParticipant;
}

export async function deleteParticipant(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("participants").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase deleteParticipant failed:", err);
    }
  }

  const store = ensureDataLoaded();
  const initialLen = store.participants.length;
  store.participants = store.participants.filter((p) => p.id !== id);
  persistLocalData(store);

  return store.participants.length < initialLen;
}

export async function resetDatabase(): Promise<void> {
  const store = ensureDataLoaded();
  store.boards = [...SEED_BOARDS];
  store.participants = [...SEED_PARTICIPANTS];
  persistLocalData(store);

  // If Supabase is active, seed into Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      for (const b of SEED_BOARDS) {
        await supabase.from("boards").upsert(boardToRow(b));
      }
      for (const p of SEED_PARTICIPANTS) {
        await supabase.from("participants").upsert(participantToRow(p));
      }
    } catch (err) {
      console.warn("Supabase reset sync failed:", err);
    }
  }
}
