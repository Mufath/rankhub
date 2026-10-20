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
} from "lucide-react";
import { Board, Participant, ParticipantStatus, BoardWithParticipants } from "@/types";
import { formatScore, maskIdentifier } from "@/lib/utils";
import { AdminBoardModal } from "./admin-board-modal";
import { AdminParticipantModal } from "./admin-participant-modal";
import { ExportModal } from "@/components/export-modal";

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
    if (!confirm("Reset database kembali ke contoh data awal (seed data)?")) return;
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

  // Render Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 mx-auto shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Gate</h1>
            <p className="text-xs text-slate-400">
              Masukkan Master Secret / Password Admin untuk mengelola papan lelang dan peserta
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Master Secret / PIN
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Ketik secret..."
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authChecking}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-500">
              Default password lokal:{" "}
              <code className="text-cyan-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                rankhub2026
              </code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Authenticated Dashboard
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Admin Top Bar */}
      <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">RankHub Admin Console</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Authorized
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kelola papan peringkat, verifikasi pembayaran lelang, dan pantau sinkronisasi bot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetSeed}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset database ke contoh default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Board Selector Tabs & Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Board Switcher Dropdown / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs text-slate-500 shrink-0 font-medium">Papan:</span>
          {boards.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelectBoard(b.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSlug === b.slug
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <span>{b.title}</span>
              {b.status === "LOCKED" && <Lock className="w-3 h-3 text-rose-400" />}
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
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          <span>Buat Papan Baru</span>
        </button>
      </div>

      {/* Current Board Detail & Controls Card */}
      {currentBoardData ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800/80">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                    /{currentBoardData.slug}
                  </span>
                  {currentBoardData.status === "ACTIVE" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      ACTIVE (Bisa Bid)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30">
                      LOCKED (Lelang Ditutup)
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                    {currentBoardData.sortOrder === "DESC" ? "DESC (Rp/Skor)" : "ASC (ms)"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {currentBoardData.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  {currentBoardData.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/board/${currentBoardData.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Lihat Publik</span>
                </Link>

                <button
                  type="button"
                  onClick={handleToggleLockBoard}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentBoardData.status === "ACTIVE"
                      ? "bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60"
                      : "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                  }`}
                >
                  {currentBoardData.status === "ACTIVE" ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kunci Lelang</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Buka Lelang</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>API & Ekspor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBoardToEdit(currentBoardData);
                    setIsBoardModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Edit Papan"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                  Total Entri
                </span>
                <span className="text-lg font-black text-white mt-0.5 block">
                  {currentBoardData.stats?.totalParticipants ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-emerald-400 block uppercase font-semibold">
                  Lunas / Verified
                </span>
                <span className="text-lg font-black text-emerald-300 mt-0.5 block">
                  {currentBoardData.stats?.verifiedParticipants ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-amber-400 block uppercase font-semibold">
                  Menunggu (Pending)
                </span>
                <span className="text-lg font-black text-amber-300 mt-0.5 block">
                  {currentBoardData.stats?.pendingParticipants ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-cyan-400 block uppercase font-semibold">
                  Nilai Teratas
                </span>
                <span className="text-lg font-black font-mono text-cyan-300 mt-0.5 block truncate">
                  {formatScore(
                    currentBoardData.stats?.topValue ?? 0,
                    currentBoardData.unitType,
                    currentBoardData.customUnit
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Participant Management Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Manajemen Peserta & Pembayaran</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setParticipantToEdit(null);
                    setIsParticipantModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>Tambah Peserta</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3.5 glass-card rounded-2xl">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="inline-flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "ALL"
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  Semua ({currentBoardData.participants.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("VERIFIED")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "VERIFIED"
                      ? "bg-emerald-950 text-emerald-300 font-semibold border border-emerald-500/30"
                      : "text-slate-400"
                  }`}
                >
                  Verified ({currentBoardData.stats?.verifiedParticipants ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("PENDING")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "PENDING"
                      ? "bg-amber-950 text-amber-300 font-semibold border border-amber-500/30"
                      : "text-slate-400"
                  }`}
                >
                  Pending ({currentBoardData.stats?.pendingParticipants ?? 0})
                </button>
              </div>
            </div>

            {/* Table */}
            {filteredParticipants.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 text-slate-400 text-xs">
                Tidak ada data peserta yang cocok.
              </div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[11px] uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">#</th>
                        <th className="px-4 py-3">Peserta & NIM / ID</th>
                        <th className="px-4 py-3 text-right">Nilai Bid / Skor</th>
                        <th className="px-4 py-3 text-center">Status Pembayaran</th>
                        <th className="px-4 py-3">Offset / Catatan</th>
                        <th className="px-4 py-3 text-right">Aksi Kontrol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredParticipants.map((p) => {
                        const delayOffset = (p.customMeta as { delayOffsetMs?: number })
                          ?.delayOffsetMs;
                        const notes = (p.customMeta as { notes?: string })?.notes;

                        return (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">
                              {p.rank}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-100 text-sm">
                                  {p.name}
                                </span>
                                <span className="font-mono text-cyan-400 text-xs">
                                  {p.identifier}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-mono font-bold text-sm text-cyan-300">
                                {formatScore(
                                  p.value,
                                  currentBoardData.unitType,
                                  currentBoardData.customUnit
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {p.status === "VERIFIED" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  PAID / VERIFIED
                                </span>
                              ) : p.status === "PENDING" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-500/30">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  PENDING
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-500/30">
                                  <Ban className="w-3 h-3 text-rose-400" />
                                  DISQUALIFIED
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                {delayOffset !== undefined && (
                                  <span className="text-[11px] font-mono text-slate-300">
                                    Offset: {delayOffset}ms
                                  </span>
                                )}
                                {notes && (
                                  <span className="text-[10px] text-slate-500 italic">
                                    {notes}
                                  </span>
                                )}
                                {!delayOffset && !notes && (
                                  <span className="text-[10px] text-slate-600">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick verification button */}
                                {p.status !== "VERIFIED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateParticipantStatus(p, "VERIFIED")}
                                    className="px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900 transition-colors"
                                    title="Tandai sudah lunas / valid"
                                  >
                                    Set Lunas
                                  </button>
                                )}
                                {p.status === "VERIFIED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateParticipantStatus(p, "PENDING")}
                                    className="px-2 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-[10px] font-bold text-amber-300 hover:bg-amber-900 transition-colors"
                                    title="Kembalikan ke pending"
                                  >
                                    Set Pending
                                  </button>
                                )}

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setParticipantToEdit(p);
                                    setIsParticipantModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                  title="Edit peserta"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteParticipant(p.id, p.name)}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/50 transition-colors"
                                  title="Hapus peserta"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Board Danger Zone */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-rose-300 block">Danger Zone</span>
              <p className="text-[11px] text-slate-400">
                Hapus papan ini beserta seluruh data lelang pesertanya secara permanen.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteBoard}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950 border border-rose-500/40 text-xs font-bold text-rose-300 hover:bg-rose-900 transition-colors cursor-pointer shrink-0"
            >
              Hapus Papan ({currentBoardData.title})
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 text-slate-400">
          <Layers className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada papan yang dipilih.</p>
          <button
            type="button"
            onClick={() => setIsBoardModalOpen(true)}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Buat Papan Pertama
          </button>
        </div>
      )}

      {/* Board Create / Edit Modal */}
      <AdminBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        boardToEdit={boardToEdit}
        adminSecret={adminSecret}
        onSaved={() => {
          fetchBoards(adminSecret);
          if (selectedSlug) {
            fetchBoardDetails(selectedSlug, adminSecret);
          }
        }}
      />

      {/* Participant Create / Edit Modal */}
      {currentBoardData && (
        <AdminParticipantModal
          board={currentBoardData}
          isOpen={isParticipantModalOpen}
          onClose={() => setIsParticipantModalOpen(false)}
          participantToEdit={participantToEdit}
          adminSecret={adminSecret}
          onSaved={() => fetchBoardDetails(currentBoardData.slug, adminSecret)}
        />
      )}

      {/* Export & API Modal */}
      {currentBoardData && (
        <ExportModal
          board={currentBoardData}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
