"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  PlusCircle,
  Layers,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Ban,
  Download,
  RotateCcw,
  LogOut,
  ExternalLink,
  Users,
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Board, Participant, ParticipantStatus, BoardWithParticipants } from "@/types";
import { formatScore, maskIdentifier } from "@/lib/utils";
import { AdminBoardModal } from "./admin-board-modal";
import { AdminParticipantModal } from "./admin-participant-modal";
import { ExportModal } from "@/components/export-modal";
import { getParticipantAvatar } from "@/lib/avatar-helper";

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Boards & Selected Board Data
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [currentBoardData, setCurrentBoardData] = useState<BoardWithParticipants | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(false);

  // Modals state
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [participantToEdit, setParticipantToEdit] = useState<Participant | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Check saved token on mount
  useEffect(() => {
    const saved = localStorage.getItem("rankhub_admin_secret");
    if (saved) {
      setAdminSecret(saved);
      verifySecret(saved);
    } else {
      setAuthChecking(false);
    }
  }, []);

  const verifySecret = async (secret: string) => {
    setAuthError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("rankhub_admin_secret", secret);
        fetchBoards(secret);
      } else {
        setIsAuthenticated(false);
        setAuthError(data.error || "Secret tidak valid");
        localStorage.removeItem("rankhub_admin_secret");
      }
    } catch {
      setIsAuthenticated(false);
      setAuthError("Gagal menghubungi server");
    } finally {
      setAuthChecking(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret.trim()) return;
    verifySecret(adminSecret.trim());
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    localStorage.removeItem("rankhub_admin_secret");
    setIsAuthenticated(false);
    setAdminSecret("");
  };

  const fetchBoards = async (secret: string) => {
    try {
      const res = await fetch("/api/boards", {
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBoards(data.data);
        if (data.data.length > 0 && !selectedSlug) {
          setSelectedSlug(data.data[0].slug);
          fetchBoardDetails(data.data[0].slug, secret);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBoardDetails = useCallback(async (slug: string, secret: string) => {
    setLoadingBoard(true);
    try {
      const res = await fetch(`/api/boards/${slug}`, {
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentBoardData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBoard(false);
    }
  }, []);

  const handleSelectBoard = (slug: string) => {
    setSelectedSlug(slug);
    fetchBoardDetails(slug, adminSecret);
  };

  // Participant status toggle (e.g. mark VERIFIED, PENDING, DISQUALIFIED)
  const handleUpdateParticipantStatus = async (
    participant: Participant,
    newStatus: ParticipantStatus
  ) => {
    if (!currentBoardData) return;
    try {
      const res = await fetch(`/api/boards/${currentBoardData.slug}/participants`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          id: participant.id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchBoardDetails(currentBoardData.slug, adminSecret);
      } else {
        alert(data.error || "Gagal mengubah status peserta");
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Participant deletion
  const handleDeleteParticipant = async (id: string, name: string) => {
    if (!currentBoardData) return;
    if (!confirm(`Hapus peserta '${name}' dari leaderboard?`)) return;

    try {
      const res = await fetch(
        `/api/boards/${currentBoardData.slug}/participants?id=${id}`,
        {
          method: "DELETE",
          headers: { "x-admin-secret": adminSecret },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        fetchBoardDetails(currentBoardData.slug, adminSecret);
      } else {
        alert(data.error || "Gagal menghapus peserta");
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Quick lock / unlock board
  const handleToggleLockBoard = async () => {
    if (!currentBoardData) return;
    const newStatus = currentBoardData.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      const res = await fetch(`/api/boards/${currentBoardData.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchBoards(adminSecret);
        fetchBoardDetails(currentBoardData.slug, adminSecret);
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Delete Board
  const handleDeleteBoard = async () => {
    if (!currentBoardData) return;
    if (
      !confirm(
        `PERINGATAN: Hapus papan '${currentBoardData.title}' beserta seluruh data pesertanya? Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/boards/${currentBoardData.slug}`, {
        method: "DELETE",
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const remaining = boards.filter((b) => b.id !== currentBoardData.id);
        setBoards(remaining);
        if (remaining.length > 0) {
          handleSelectBoard(remaining[0].slug);
        } else {
          setCurrentBoardData(null);
          setSelectedSlug("");
        }
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Reset to seed
  const handleResetSeed = async () => {
    if (!confirm("Reset database kembali ke data default RankHub?")) return;
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Database berhasil di-reset!");
        fetchBoards(adminSecret);
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Filter participants
  const filteredParticipants = (currentBoardData?.participants || []).filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.name.toLowerCase().includes(q) || p.identifier.toLowerCase().includes(q);
    }
    return true;
  });

  // Render Auth Gate in Apple Luxury Warm Theme
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen py-12 px-4 flex items-center justify-center bg-[#ECE7D5]">
        <div className="w-full max-w-md p-8 rounded-[40px] bg-[#FAF6E9] border border-white/90 shadow-[0_30px_70px_rgba(0,0,0,0.12)] relative overflow-hidden animate-entrance">
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 mx-auto shadow-lg shadow-orange-500/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Rank<span className="text-[#E8890C]">Hub</span> Admin Gate
            </h1>
            <p className="text-xs text-gray-500 font-semibold">
              Masukkan Master Secret / Password Admin untuk mengelola papan lelang dan peserta
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Master Secret / PIN
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="Ketik secret..."
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-amber-900/10 rounded-2xl text-xs font-mono font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authChecking}
              className="w-full py-3 rounded-full font-bold text-xs bg-gradient-to-r from-amber-500 to-[#E8890C] hover:from-amber-600 hover:to-[#d47c09] text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {authChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buka Panel Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200/80 text-center flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-semibold">
              Default password: <code className="font-mono text-amber-700 font-bold">rankhub2026</code>
            </span>
            <Link href="/" className="text-xs font-bold text-gray-700 hover:text-amber-800 transition-colors">
              Ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Render Authenticated Dashboard in Apple Luxury Warm Theme
  return (
    <main className="min-h-screen py-4 sm:py-6 px-2 sm:px-4 lg:px-6 bg-[#ECE7D5] overflow-x-hidden flex flex-col items-center">
      <div className="w-full max-w-[96vw] xl:max-w-[1400px] 2xl:max-w-[1520px] mx-auto space-y-6">
        {/* Admin Top Bar */}
        <header className="p-4 sm:p-6 rounded-[36px] bg-[#FAF6E9] border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">
                  Rank<span className="text-[#E8890C]">Hub</span> Admin Console
                </h1>
                <span className="apple-badge">
                  <span className="apple-badge-dot-green" />
                  <span>Authorized</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 font-semibold">
                Kelola papan peringkat, verifikasi status pembayaran, dan pantau sinkronisasi bot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Leaderboard</span>
            </Link>

            <button
              type="button"
              onClick={handleResetSeed}
              className="px-3 py-1.5 rounded-full bg-white/70 hover:bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Reset database ke default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Seed</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Board Selector Tabs & Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Board Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-gray-500 shrink-0 font-bold">Papan:</span>
            {boards.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBoard(b.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSlug === b.slug
                    ? "bg-[#FFDE32] text-gray-900 shadow-sm"
                    : "bg-[#EFE9D2]/70 text-gray-700 hover:bg-white/60"
                }`}
              >
                <span>{b.title}</span>
                {b.status === "LOCKED" && <Lock className="w-3 h-3 text-rose-600" />}
              </button>
            ))}
          </div>

          {/* Create Board Button */}
          <button
            type="button"
            onClick={() => {
              setBoardToEdit(null);
              setIsBoardModalOpen(true);
            }}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#E8890C] hover:bg-[#d47c09] text-white shadow-md flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Papan Baru</span>
          </button>
        </div>

        {/* Current Board Detail & Controls Card */}
        {currentBoardData ? (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-[40px] bg-[#FAF6E9] border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.10)]">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#EFE9D2] text-amber-900 font-bold border border-amber-900/10">
                      /{currentBoardData.slug}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        currentBoardData.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : currentBoardData.status === "LOCKED"
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {currentBoardData.status}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/70 text-gray-600 border border-gray-200 font-medium">
                      {currentBoardData.sortOrder === "DESC" ? "Tertinggi (Desc)" : "Tercepat (Asc)"}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {currentBoardData.title}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1 max-w-xl">
                    {currentBoardData.description || "Tidak ada deskripsi"}
                  </p>
                </div>

                {/* Board Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/board/${currentBoardData.slug}`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lihat Publik</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setBoardToEdit(currentBoardData);
                      setIsBoardModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-gray-500" />
                    <span>Edit Papan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleLockBoard}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                      currentBoardData.status === "ACTIVE"
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300"
                    }`}
                  >
                    {currentBoardData.status === "ACTIVE" ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Kunci Lelang</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Buka Lelang</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3.5 py-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ekspor / API</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteBoard}
                    className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors shadow-xs cursor-pointer"
                    title="Hapus papan ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="p-4 rounded-2xl bg-white/70 border border-amber-900/10">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Total Peserta
                  </div>
                  <div className="text-2xl font-black text-gray-900 mt-1">
                    {currentBoardData.participants.length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-amber-900/10">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Verified (Lunas)
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {currentBoardData.participants.filter((p) => p.status === "VERIFIED").length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-amber-900/10">
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    Pending Transfer
                  </div>
                  <div className="text-2xl font-black text-amber-700 mt-1">
                    {currentBoardData.participants.filter((p) => p.status === "PENDING").length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-amber-900/10">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Nilai Tertinggi
                  </div>
                  <div className="text-xl font-black text-gray-900 mt-1 font-mono truncate">
                    {currentBoardData.participants.length > 0
                      ? formatScore(
                          currentBoardData.participants[0].value,
                          currentBoardData.unitType,
                          currentBoardData.customUnit
                        )
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Management Section */}
            <div className="p-6 sm:p-8 rounded-[40px] bg-[#FAF6E9] border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.10)] space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-gray-900">Daftar Peserta & Urutan</h3>
                  <span className="text-xs font-bold text-gray-500">
                    ({filteredParticipants.length} dari {currentBoardData.participants.length})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search box */}
                  <div className="flex items-center gap-2 bg-white/80 border border-amber-900/10 rounded-full px-3 py-1.5 shadow-xs">
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama / NIM..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-gray-800 placeholder-gray-400 border-none outline-none focus:ring-0 p-0 w-28 sm:w-36 font-medium"
                    />
                  </div>

                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white/80 border border-amber-900/10 rounded-full text-xs font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="VERIFIED">Hanya Verified</option>
                    <option value="PENDING">Hanya Pending</option>
                    <option value="DISQUALIFIED">Disqualified</option>
                  </select>

                  {/* Add participant button */}
                  <button
                    type="button"
                    onClick={() => {
                      setParticipantToEdit(null);
                      setIsParticipantModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8890C] hover:bg-[#d47c09] text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Peserta</span>
                  </button>
                </div>
              </div>

              {/* Participants Rows */}
              <div className="space-y-2 pt-2">
                {filteredParticipants.length === 0 ? (
                  <div className="p-8 text-center bg-white/40 border border-gray-200/60 rounded-3xl text-gray-500 text-xs">
                    Tidak ada peserta yang ditemukan.
                  </div>
                ) : (
                  filteredParticipants.map((p, index) => {
                    const rank = p.rank || index + 1;
                    const meta = p.customMeta as Record<string, unknown> | undefined;

                    return (
                      <div
                        key={p.id}
                        className="ranking-pill-row rounded-full px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank badge */}
                          <span
                            className={`w-7 h-7 shrink-0 rounded-full border text-gray-900 font-extrabold text-xs flex items-center justify-center shadow-xs ${
                              rank === 1
                                ? "border-amber-400 bg-amber-100 text-amber-900"
                                : rank === 2
                                ? "border-blue-400 bg-sky-100 text-sky-900"
                                : rank === 3
                                ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {rank}
                          </span>

                          {/* Avatar */}
                          <img
                            alt={p.name}
                            className="w-9 h-9 rounded-full object-cover border border-white shrink-0"
                            src={getParticipantAvatar(p, index)}
                          />

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900 truncate">{p.name}</h4>
                              <span className="font-mono text-[11px] text-gray-500 font-semibold">
                                ({p.identifier})
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 font-medium truncate flex items-center gap-2">
                              {Boolean(meta?.telegram) && (
                                <span className="text-sky-600 font-semibold">{String(meta?.telegram)}</span>
                              )}
                              {Boolean(meta?.note) && <span>• {String(meta?.note)}</span>}
                              {Boolean(meta?.notes) && <span>• {String(meta?.notes)}</span>}
                              {meta?.delayOffsetMs !== undefined && (
                                <span className="text-amber-700 font-mono">
                                  • Delay: {String(meta.delayOffsetMs)}ms
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                          {/* Status and Action Controls */}
                          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60">
                            <span className="text-sm font-black text-gray-900 font-mono pr-1">
                              {formatScore(p.value, currentBoardData.unitType, currentBoardData.customUnit)}
                            </span>

                            {/* Apple-Style Status Pill */}
                            {p.status === "VERIFIED" ? (
                              <span className="apple-badge">
                                <span className="apple-badge-dot-green" />
                                <span>Lunas</span>
                              </span>
                            ) : p.status === "PENDING" ? (
                              <span className="apple-badge">
                                <span className="apple-badge-dot-amber" />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <span className="apple-badge">
                                <span className="apple-badge-dot-rose" />
                                <span>Diskualifikasi</span>
                              </span>
                            )}

                            {/* Apple Action Button: Tandai Lunas (if pending) */}
                            {p.status !== "VERIFIED" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateParticipantStatus(p, "VERIFIED")}
                                className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#1C1C1E] hover:bg-black text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                                title="Tandai Sudah Bayar / Lunas"
                              >
                                Tandai Lunas
                              </button>
                            )}

                            {/* Edit & Delete actions */}
                            <div className="flex items-center gap-1 pl-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setParticipantToEdit(p);
                                  setIsParticipantModalOpen(true);
                                }}
                                className="p-1.5 rounded-full hover:bg-black/5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                                title="Edit peserta"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteParticipant(p.id, p.name)}
                                className="p-1.5 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Hapus peserta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-[#FAF6E9] border border-white/80 rounded-[40px] text-gray-500">
            {loadingBoard ? "Memuat data papan..." : "Belum ada papan peringkat yang dipilih."}
          </div>
        )}
      </div>

      {/* Admin Modals */}
      {currentBoardData && (
        <>
          <AdminBoardModal
            isOpen={isBoardModalOpen}
            onClose={() => setIsBoardModalOpen(false)}
            onSaved={() => {
              fetchBoards(adminSecret);
              fetchBoardDetails(currentBoardData.slug, adminSecret);
            }}
            boardToEdit={boardToEdit}
            adminSecret={adminSecret}
          />

          <AdminParticipantModal
            board={currentBoardData}
            isOpen={isParticipantModalOpen}
            onClose={() => setIsParticipantModalOpen(false)}
            onSaved={() => fetchBoardDetails(currentBoardData.slug, adminSecret)}
            participantToEdit={participantToEdit}
            adminSecret={adminSecret}
          />

          <ExportModal
            board={currentBoardData}
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
          />
        </>
      )}
    </main>
  );
}
