import { Board, Participant } from "@/types";

const now = new Date();
const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

export const SEED_BOARDS: Board[] = [
  {
    id: "board-subsecond-w10",
    slug: "lelang-subsecond-w10",
    title: "Lelang SubSecond Priority Queue W10",
    description:
      "Lelang penentuan urutan eksekusi bot SubSecond untuk Batch Week 10. Peserta dengan bid terverifikasi tertinggi akan diprioritaskan pada antrean millisecond teratas.",
    bannerNotes:
      "⚠️ PERHATIAN: Cutoff lelang ditutup otomatis saat timer habis. Status PENDING harus ditransfer dan diverifikasi Admin sebelum deadline agar masuk ke antrean bot Cloudflare Worker.",
    sortOrder: "DESC",
    unitType: "CURRENCY_IDR",
    status: "ACTIVE",
    deadline: twoDaysLater,
    visibility: "PUBLIC",
    config: {
      enablePodium: true,
      maskIdentifiersByDefault: true,
      allowPublicSubmit: true,
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "board-speedrun-algo",
    slug: "turnamen-speedrun-coding",
    title: "Turnamen Speedrun Algoritma 2026",
    description:
      "Leaderboard waktu eksekusi kode tercepat (latency dalam ms) untuk memecahkan 5 problem dynamic programming.",
    bannerNotes:
      "Catatan waktu diuji pada server benchmark standar. Nilai terkecil (tercepat) menempati peringkat 1.",
    sortOrder: "ASC",
    unitType: "MILLISECONDS",
    status: "ACTIVE",
    deadline: fiveHoursLater,
    visibility: "PUBLIC",
    config: {
      enablePodium: true,
      maskIdentifiersByDefault: false,
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "board-antrean-project",
    slug: "antrean-project-vip",
    title: "Antrean VIP Audit Arsitektur Cloud",
    description:
      "Papan antrean prioritas review pull request dan konsultasi arsitektur cloud enterprise.",
    bannerNotes: "Lelang batch ini telah SELESAI dan urutan telah dikunci (LOCKED).",
    sortOrder: "DESC",
    unitType: "SCORE",
    customUnit: "poin",
    status: "LOCKED",
    deadline: yesterday,
    visibility: "PUBLIC",
    config: {
      enablePodium: true,
      maskIdentifiersByDefault: true,
    },
    createdAt: yesterday,
    updatedAt: yesterday,
  },
];

export const SEED_PARTICIPANTS: Participant[] = [
  // Board 1: SubSecond Priority Queue
  {
    id: "part-1",
    boardId: "board-subsecond-w10",
    name: "CyberSniper_99",
    identifier: "21120120140088",
    value: 550000,
    status: "VERIFIED",
    customMeta: {
      delayOffsetMs: 5,
      telegram: "@cybersniper",
      tier: "Alpha",
      notes: "Transfer BCA valid",
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-2",
    boardId: "board-subsecond-w10",
    name: "Mhs_FastTrack",
    identifier: "21120120140042",
    value: 480000,
    status: "VERIFIED",
    customMeta: {
      delayOffsetMs: 15,
      telegram: "@fast_tracker",
      tier: "Alpha",
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-3",
    boardId: "board-subsecond-w10",
    name: "QuantumRunner",
    identifier: "21120120140115",
    value: 420000,
    status: "VERIFIED",
    customMeta: {
      delayOffsetMs: 30,
      tier: "Beta",
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-4",
    boardId: "board-subsecond-w10",
    name: "BytePhantom",
    identifier: "21120120140061",
    value: 390000,
    status: "PENDING",
    customMeta: {
      telegram: "@bytephantom",
      notes: "Menunggu bukti bayar",
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-5",
    boardId: "board-subsecond-w10",
    name: "ApexTrigger",
    identifier: "21120120140023",
    value: 350000,
    status: "VERIFIED",
    customMeta: {
      delayOffsetMs: 45,
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-6",
    boardId: "board-subsecond-w10",
    name: "KsatriaLatency",
    identifier: "21120120140199",
    value: 300000,
    status: "VERIFIED",
    customMeta: {
      delayOffsetMs: 60,
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-7",
    boardId: "board-subsecond-w10",
    name: "ZeroPacketLoss",
    identifier: "21120120140004",
    value: 280000,
    status: "PENDING",
    customMeta: {
      notes: "Pending admin review",
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },

  // Board 2: Speedrun coding (Ascending - lower ms is better)
  {
    id: "part-algo-1",
    boardId: "board-speedrun-algo",
    name: "AlgoWizard",
    identifier: "tim_binary_01",
    value: 48, // 48ms
    status: "VERIFIED",
    customMeta: { lang: "Rust", memory: "2.1MB" },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-algo-2",
    boardId: "board-speedrun-algo",
    name: "CPlusPlusLord",
    identifier: "tim_cpp_ultra",
    value: 62, // 62ms
    status: "VERIFIED",
    customMeta: { lang: "C++20", memory: "3.4MB" },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-algo-3",
    boardId: "board-speedrun-algo",
    name: "GoRoutinesMaster",
    identifier: "tim_gopher",
    value: 115, // 115ms
    status: "VERIFIED",
    customMeta: { lang: "Go 1.22", memory: "5.8MB" },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "part-algo-4",
    boardId: "board-speedrun-algo",
    name: "NodeOptimizer",
    identifier: "tim_v8_jit",
    value: 198, // 198ms
    status: "VERIFIED",
    customMeta: { lang: "TypeScript", memory: "18.2MB" },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },

  // Board 3: Locked project queue
  {
    id: "part-proj-1",
    boardId: "board-antrean-project",
    name: "Fintech Core Gateway",
    identifier: "org_fintech_id",
    value: 980,
    status: "VERIFIED",
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: "part-proj-2",
    boardId: "board-antrean-project",
    name: "Healthcare EHR System",
    identifier: "org_med_care",
    value: 840,
    status: "VERIFIED",
    createdAt: yesterday,
    updatedAt: yesterday,
  },
];
