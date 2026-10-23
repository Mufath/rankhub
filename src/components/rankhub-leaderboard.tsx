"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  Board,
  Participant,
  RealtimeOutbidPayload,
  RealtimeDeadlinePayload,
} from "@/types";
import { formatScore } from "@/lib/utils";
import {
  getParticipantAvatar,
  getParticipantDeckOrSubtitle,
  getParticipantTierTitle,
} from "@/lib/avatar-helper";
import { SubmitBidModal } from "./submit-bid-modal";
import { ExportModal } from "./export-modal";

export interface RankHubLeaderboardProps {
  initialBoard: Board;
  initialParticipants: Participant[];
  allBoards?: Board[];
}

export function RankHubLeaderboard({
  initialBoard,
  initialParticipants,
  allBoards = [],
}: RankHubLeaderboardProps) {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [period, setPeriod] = useState<"weekly" | "alltime">("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Point 2: Realtime Live State & Alert Banners
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [outbidAlert, setOutbidAlert] = useState<RealtimeOutbidPayload | null>(null);
  const [antiSnipingAlert, setAntiSnipingAlert] = useState<RealtimeDeadlinePayload | null>(null);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);

  // Dropdown hover control (smooth without disappearing)
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterDropdown = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setIsBoardDropdownOpen(true);
  };

  const handleMouseLeaveDropdown = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setIsBoardDropdownOpen(false);
    }, 200);
  };

  // Top 3 Podium Participants
  const top1 = participants[0];
  const top2 = participants[1];
  const top3 = participants[2];

  // Refresh live data manually from API
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

  // Point 2: SSE Live Stream Connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimer: NodeJS.Timeout | null = null;

    function connectSSE() {
      try {
        eventSource = new EventSource(`/api/boards/${board.slug}/live`);

        eventSource.addEventListener("CONNECTED", () => {
          setIsLiveConnected(true);
        });

        eventSource.addEventListener("INIT", (e) => {
          setIsLiveConnected(true);
          try {
            const data = JSON.parse(e.data);
            if (data.participants) {
              setParticipants(data.participants);
            }
            if (data.board) {
              setBoard(data.board);
            }
          } catch {}
        });

        eventSource.addEventListener("PARTICIPANTS_UPDATED", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.participants) {
              setParticipants(data.participants);
            }
            if (data.board) {
              setBoard((prev) => ({ ...prev, ...data.board }));
            }
          } catch {}
        });

        eventSource.addEventListener("OUTBID_ALERT", (e) => {
          try {
            const alert = JSON.parse(e.data) as RealtimeOutbidPayload;
            setOutbidAlert(alert);
            triggerConfetti();
            setTimeout(() => setOutbidAlert(null), 8000);
          } catch {}
        });

        eventSource.addEventListener("DEADLINE_EXTENDED", (e) => {
          try {
            const ext = JSON.parse(e.data) as RealtimeDeadlinePayload;
            setAntiSnipingAlert(ext);
            setBoard((prev) => ({ ...prev, deadline: ext.newDeadline }));
            setTimeout(() => setAntiSnipingAlert(null), 8000);
          } catch {}
        });

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          retryTimer = setTimeout(connectSSE, 4000);
        };
      } catch {
        setIsLiveConnected(false);
        retryTimer = setTimeout(connectSSE, 5000);
      }
    }

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [board.slug]);

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
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#F5CF46", "#FF9E1B", "#38BDF8", "#10B981"],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative w-full max-w-[96vw] xl:max-w-[1400px] 2xl:max-w-[1520px] mx-auto py-1 sm:py-3 px-1 sm:px-2">
      {/* =========================================================
          MAIN CONTAINER: RANKHUB LUXURY APPLE DASHBOARD (IMMERSIVE EXPANDED)
          ========================================================= */}
      <main
        className="w-full bg-[#FAF6E9] rounded-[36px] sm:rounded-[48px] md:rounded-[56px] shadow-[0_25px_65px_rgba(0,0,0,0.08)] border border-white/80 p-5 sm:p-8 lg:p-12 relative overflow-visible animate-entrance flex flex-col"
        data-purpose="leaderboard-container"
      >
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3 border-b border-gray-200/60">
          {/* Brand Logo & Live Pulse Badge */}
          <div className="flex items-center gap-3 select-none pl-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
              <i className="fa-solid fa-ranking-star text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-none">
                  Rank<span className="text-[#E8890C] font-extrabold">Hub</span>
                </div>
                {/* Live Stream Pulse Badge */}
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-gray-200/80 text-[10px] font-black uppercase tracking-wider shadow-2xs"
                  title={isLiveConnected ? "Tersambung ke Realtime Stream" : "Mencoba menyambungkan ke Stream"}
                >
                  <span className="relative flex h-2 w-2">
                    {isLiveConnected ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    )}
                  </span>
                  <span className={isLiveConnected ? "text-emerald-700" : "text-amber-700"}>
                    {isLiveConnected ? "LIVE" : "SYNC"}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-semibold tracking-wide">
                {board.title}
              </span>
            </div>
          </div>

          {/* Navigation & Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <nav className="flex items-center bg-[#EFE9D2]/70 p-1.5 rounded-full text-xs font-semibold text-gray-600 gap-1 shadow-sm">
              {/* Dropdown: Papan Lain (Hover activated, smooth bridge) */}
              {allBoards.length > 1 && (
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnterDropdown}
                  onMouseLeave={handleMouseLeaveDropdown}
                >
                  <button
                    type="button"
                    onClick={() => setIsBoardDropdownOpen((prev) => !prev)}
                    className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                      isBoardDropdownOpen
                        ? "bg-white text-gray-900 shadow-sm"
                        : "hover:text-gray-900 hover:bg-white/60 text-gray-700"
                    }`}
                  >
                    <i className="fa-solid fa-table-cells-large text-amber-600 text-xs" />
                    <span>Papan Lain</span>
                    <i
                      className={`fa-solid fa-chevron-down text-[9px] text-gray-400 transition-transform duration-200 ${
                        isBoardDropdownOpen ? "rotate-180 text-amber-600" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown menu container with hit-bridge to prevent closing */}
                  <div
                    className={`absolute left-0 top-full pt-1.5 w-64 z-50 transition-all duration-200 ${
                      isBoardDropdownOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-1 pointer-events-none"
                    }`}
                  >
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/90 p-2 space-y-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Pilih Papan Peringkat
                      </div>
                      {allBoards.map((b) => (
                        <Link
                          key={b.id}
                          href={`/board/${b.slug}`}
                          onClick={() => setIsBoardDropdownOpen(false)}
                          className={`block px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                            b.slug === board.slug
                              ? "bg-amber-100 text-amber-900"
                              : "text-gray-700 hover:bg-amber-50 hover:text-amber-900"
                          }`}
                        >
                          <div className="truncate">{b.title}</div>
                          <div className="text-[10px] text-gray-400 font-normal">
                            {b.unitType === "CURRENCY_IDR"
                              ? "Lelang Rp"
                              : b.unitType === "MILLISECONDS"
                              ? "Latency ms"
                              : "Skor"}
                          </div>
                        </Link>
                      ))}
                    </div>
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

            {/* Quick Action: Tambah Peserta */}
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

        {/* =========================================================
            POINT 2 & 5: DYNAMIC LIVE OUTBID & ANTI-SNIPING ALERTS
            ========================================================= */}
        <AnimatePresence>
          {outbidAlert && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-400/40 backdrop-blur-md flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 text-white flex items-center justify-center font-bold text-base shadow-md shadow-orange-500/25">
                  🔥
                </span>
                <div>
                  <div className="text-xs font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <span>PEREBUTAN PERINGKAT #1</span>
                    <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                      LIVE OUTBID
                    </span>
                  </div>
                  <div className="text-xs text-gray-800 font-medium mt-0.5">
                    <strong className="text-gray-950 font-bold">{outbidAlert.newLeader}</strong>{" "}
                    merebut takhta Peringkat 1 dengan tawaran{" "}
                    <span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      {outbidAlert.formattedValue}
                    </span>
                    {outbidAlert.previousLeader && (
                      <span className="text-gray-500 ml-1">
                        (melampaui {outbidAlert.previousLeader})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOutbidAlert(null)}
                className="text-gray-400 hover:text-gray-700 text-xs px-2.5 py-1 rounded-lg hover:bg-black/5 cursor-pointer font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}

          {antiSnipingAlert && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/15 border border-amber-400/40 flex items-center gap-3 text-amber-950 shadow-md"
            >
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shrink-0 font-bold shadow-xs">
                ⚡
              </span>
              <div className="text-xs flex-1">
                <div className="font-extrabold flex items-center gap-2">
                  <span>ANTI-SNIPING (SOFT CLOSE) AKTIF</span>
                  <span className="text-[10px] bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    +{antiSnipingAlert.addedSeconds} DETIK
                  </span>
                </div>
                <div className="text-amber-900/90 font-medium mt-0.5">
                  Tawaran menit terakhir dari <strong>{antiSnipingAlert.triggeredBy}</strong>{" "}
                  memperpanjang cutoff lelang. Waktu hitung mundur otomatis diperbarui!
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAntiSnipingAlert(null)}
                className="text-amber-800 text-xs px-2.5 py-1 rounded-lg hover:bg-amber-500/15 cursor-pointer font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Bar: Weekly / All time + Search + Actions */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3 pt-1">
          {/* Sliding Pill Switch & Actions */}
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
              className="px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Ekspor</span>
            </button>
          </div>

          {/* Search Box & Top 1 Player Mini Chip */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white/70 focus-within:bg-white border border-gray-200/80 rounded-full px-3.5 py-1.5 shadow-xs transition-all">
              <i className="fa-solid fa-magnifying-glass text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Cari peserta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-gray-800 placeholder-gray-400 border-none outline-none focus:ring-0 p-0 w-28 sm:w-40 font-medium"
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
                className="flex items-center gap-2 bg-[#FAF2D4] border border-amber-200/80 pl-1.5 pr-3 py-1 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
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
                  <div className="text-[11px] font-bold text-gray-900 truncate max-w-[100px]">
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
            3D GROUNDED CYLINDRICAL PODIUM (REAL DATA + HARMONIOUS INTERACTION)
            ========================================================= */}
        <section className="ambient-glow pt-3 pb-6 px-2 sm:px-6 rounded-3xl relative mb-2">
          {/* Columns Grid */}
          <div className="grid grid-cols-3 max-w-2xl mx-auto items-end pt-4 pb-0 relative z-10">
            {/* 2nd Place: Silver Podium Pillar */}
            <div
              id="podium-card-2"
              onClick={() => top2 && handleRowClick(top2.name, 2)}
              className="podium-card flex flex-col items-center text-center z-10 -mr-2 relative cursor-pointer"
              data-player={top2?.name || "Rank 2"}
            >
              {top2 ? (
                <>
                  {/* Harmonious Apple-Style Interactive Tooltip */}
                  <div className="stat-tooltip absolute -top-16 left-1/2 bg-white/95 text-gray-900 rounded-2xl py-2 px-3.5 shadow-[0_12px_28px_rgba(180,140,50,0.22)] backdrop-blur-md z-40 whitespace-nowrap text-left border border-amber-200/90 flex flex-col gap-1 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-award text-sky-600 text-[11px]" />
                      <span className="text-[10px] text-sky-900 font-extrabold uppercase tracking-wider">
                        Rank #2 • {getParticipantTierTitle(top2)}
                      </span>
                    </div>
                    <div className="text-xs font-bold flex items-center gap-2">
                      <span className="apple-badge">
                        <span className={top2.status === "VERIFIED" ? "apple-badge-dot-green" : "apple-badge-dot-amber"} />
                        <span>{top2.status}</span>
                      </span>
                      <span className="text-gray-300 font-normal">|</span>
                      <span className="font-mono text-amber-900 font-extrabold text-xs">
                        {formatScore(top2.value, board.unitType, board.customUnit)}
                      </span>
                    </div>
                    {/* Tooltip Down Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-amber-200/90 rotate-45" />
                  </div>

                  <div className="relative mb-2 flex flex-col items-center floating-anim-2">
                    <div className="avatar-ring w-18 h-18 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 shadow-lg transition-transform">
                      <img
                        alt={top2.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                        src={getParticipantAvatar(top2, 1)}
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-slate-600 border-2 border-white flex items-center justify-center text-white text-[10px] shadow">
                      <i className="fa-solid fa-award" />
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm md:text-base text-gray-900 tracking-tight truncate max-w-[130px]">
                    {top2.name}
                  </h3>
                  <span className="inline-block mt-1 bg-black text-white font-bold text-[11px] px-3 py-0.5 rounded-full shadow-md font-mono">
                    {formatScore(top2.value, board.unitType, board.customUnit)}
                  </span>

                  <div className="relative z-20 mt-3 -mb-5 flex justify-center">
                    <div className="w-12 h-12 medal-3d medal-3d-silver ribbon-silver flex items-center justify-center text-slate-800">
                      <i className="fa-solid fa-award text-base text-slate-700 drop-shadow-sm" />
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
                  Posisi #2 Kosong
                </div>
              )}
            </div>

            {/* 1st Place: Gold Podium Pillar */}
            <div
              id="podium-card-1"
              onClick={() => {
                if (top1) {
                  handleRowClick(top1.name, 1);
                  triggerConfetti();
                }
              }}
              className="podium-card flex flex-col items-center text-center z-30 relative cursor-pointer"
              data-player={top1?.name || "Rank 1"}
            >
              {top1 ? (
                <>
                  {/* Harmonious Apple-Style Interactive Tooltip */}
                  <div className="stat-tooltip absolute -top-16 left-1/2 bg-white/95 text-gray-900 rounded-2xl py-2 px-3.5 shadow-[0_12px_28px_rgba(230,160,20,0.3)] backdrop-blur-md z-40 whitespace-nowrap text-left border border-amber-300/90 flex flex-col gap-1 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-crown text-amber-500 text-[11px]" />
                      <span className="text-[10px] text-amber-950 font-black uppercase tracking-wider">
                        Rank #1 • {getParticipantTierTitle(top1)}
                      </span>
                    </div>
                    <div className="text-xs font-bold flex items-center gap-2">
                      <span className="apple-badge">
                        <span className={top1.status === "VERIFIED" ? "apple-badge-dot-green" : "apple-badge-dot-amber"} />
                        <span>{top1.status}</span>
                      </span>
                      <span className="text-gray-300 font-normal">|</span>
                      <span className="font-mono text-amber-900 font-extrabold text-xs">
                        {formatScore(top1.value, board.unitType, board.customUnit)}
                      </span>
                    </div>
                    {/* Tooltip Down Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-amber-300/90 rotate-45" />
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

                  <h3 className="font-extrabold text-base md:text-lg text-gray-900 tracking-tight truncate max-w-[150px]">
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
                    <div className="cylinder-base w-full h-40 md:h-44">
                      <div className="cylinder-cap" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-42 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-3xl">
                  Posisi #1 Kosong
                </div>
              )}
            </div>

            {/* 3rd Place: Bronze Podium Pillar */}
            <div
              id="podium-card-3"
              onClick={() => top3 && handleRowClick(top3.name, 3)}
              className="podium-card flex flex-col items-center text-center z-10 -ml-2 relative cursor-pointer"
              data-player={top3?.name || "Rank 3"}
            >
              {top3 ? (
                <>
                  {/* Harmonious Apple-Style Interactive Tooltip */}
                  <div className="stat-tooltip absolute -top-16 left-1/2 bg-white/95 text-gray-900 rounded-2xl py-2 px-3.5 shadow-[0_12px_28px_rgba(180,140,50,0.22)] backdrop-blur-md z-40 whitespace-nowrap text-left border border-amber-200/90 flex flex-col gap-1 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-star text-amber-700 text-[11px]" />
                      <span className="text-[10px] text-amber-950 font-extrabold uppercase tracking-wider">
                        Rank #3 • {getParticipantTierTitle(top3)}
                      </span>
                    </div>
                    <div className="text-xs font-bold flex items-center gap-2">
                      <span className="apple-badge">
                        <span className={top3.status === "VERIFIED" ? "apple-badge-dot-green" : "apple-badge-dot-amber"} />
                        <span>{top3.status}</span>
                      </span>
                      <span className="text-gray-300 font-normal">|</span>
                      <span className="font-mono text-amber-900 font-extrabold text-xs">
                        {formatScore(top3.value, board.unitType, board.customUnit)}
                      </span>
                    </div>
                    {/* Tooltip Down Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-amber-200/90 rotate-45" />
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
                      <i className="fa-solid fa-star" />
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm md:text-base text-gray-900 tracking-tight truncate max-w-[130px]">
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
                    <div className="cylinder-base w-full h-22 md:h-26">
                      <div className="cylinder-cap" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-24 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-3xl">
                  Posisi #3 Kosong
                </div>
              )}
            </div>
          </div>

          {/* =========================================================
              UNIFIED GROUNDED STAGE PLATFORM (Flush & Fully Anchored)
              ========================================================= */}
          <div className="podium-stage-platform">
            <div className="podium-stage-cap">
              <span className="px-3.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white shadow-sm border border-white/60">
                ★ TOP 3 RANKHUB PODIUM ★
              </span>
            </div>
            <div className="podium-stage-base" />
            <div className="podium-stage-shadow" />
          </div>
        </section>

        {/* =========================================================
            LEADERBOARD PILL ROWS (POINT 2: FRAMER-MOTION SMOOTH RE-RANKING)
            ========================================================= */}
        <section className="space-y-2.5 relative z-10" id="leaderboard-list">
          {filteredParticipants.length === 0 ? (
            <div className="p-8 text-center bg-white/40 border border-gray-200/60 rounded-3xl text-gray-500 text-xs">
              Belum ada peserta yang cocok dengan filter pencarian.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredParticipants.map((p, index) => {
                const isSelected = selectedPlayer === p.name;
                const rank = p.rank || index + 1;
                const subtitle = getParticipantDeckOrSubtitle(p);
                const tier = getParticipantTierTitle(p);
                const isFlashing = recentlyUpdatedId === p.id;

                return (
                  <motion.article
                    layout
                    layoutId={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 32,
                    }}
                    key={p.id}
                    onClick={() => handleRowClick(p.name, rank)}
                    className={`ranking-pill-row rounded-full px-5 sm:px-7 py-3 flex items-center justify-between cursor-pointer group transition-all ${
                      isSelected ? "ring-2 ring-amber-400 bg-white/95" : ""
                    } ${isFlashing ? "ring-2 ring-amber-500 bg-amber-50/90 shadow-md" : ""}`}
                    data-name={p.name}
                    data-purpose="rank-row"
                  >
                    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                      {/* Rank Circle */}
                      <span
                        className={`w-8 h-8 shrink-0 rounded-full border text-xs flex items-center justify-center shadow-xs transition-colors ${
                          rank === 1
                            ? "border-amber-400/80 bg-gradient-to-b from-amber-50 to-amber-100 text-amber-950 font-black"
                            : rank === 2
                            ? "border-slate-300 bg-gradient-to-b from-white to-slate-100 text-slate-800 font-black"
                            : rank === 3
                            ? "border-amber-700/40 bg-gradient-to-b from-orange-50 to-amber-100 text-amber-950 font-black"
                            : "border-black/5 bg-white text-gray-700 font-bold"
                        }`}
                      >
                        {rank}
                      </span>

                      {/* Avatar & Element Badge */}
                      <div className="relative shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          alt={p.name}
                          className={`w-11 h-11 rounded-full object-cover border-2 ${
                            rank === 1
                              ? "border-amber-400"
                              : rank === 2
                              ? "border-slate-300"
                              : rank === 3
                              ? "border-amber-700/50"
                              : "border-gray-200"
                          }`}
                          src={getParticipantAvatar(p, index)}
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${
                            rank === 1
                              ? "bg-amber-500"
                              : rank === 2
                              ? "bg-slate-600"
                              : rank === 3
                              ? "bg-amber-700"
                              : "bg-gray-400"
                          } text-white text-[8px] flex items-center justify-center border border-white`}
                        >
                          <i
                            className={`fa-solid ${
                              rank === 1
                                ? "fa-crown"
                                : rank === 2
                                ? "fa-award"
                                : rank === 3
                                ? "fa-star"
                                : "fa-bolt"
                            }`}
                          />
                        </span>
                      </div>

                      {/* Name & Subtitle Info */}
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight group-hover:text-amber-900 transition-colors truncate">
                          {p.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                          {subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Center: Tier Status Badge */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <span
                        className={
                          rank === 1 ? "text-amber-500" : rank <= 3 ? "text-sky-500" : "text-slate-400"
                        }
                      >
                        <i className="fa-solid fa-ribbon text-base" />
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          rank <= 3 ? "text-gray-900" : "text-gray-600 font-semibold"
                        }`}
                      >
                        {tier}
                      </span>
                    </div>

                    {/* Right: Real Formatted Score */}
                    <div className="text-right shrink-0 pl-2">
                      <span className="text-sm sm:text-base font-black text-gray-900 group-hover:text-amber-700 transition-colors font-mono">
                        {formatScore(p.value, board.unitType, board.customUnit)}
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          )}
        </section>
      </main>

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
