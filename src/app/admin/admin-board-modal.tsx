"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, Layers } from "lucide-react";
import { Board, BoardSortOrder, BoardUnitType, BoardStatus, BoardVisibility } from "@/types";

interface AdminBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  boardToEdit?: Board | null;
  adminSecret: string;
}

export function AdminBoardModal({
  isOpen,
  onClose,
  onSaved,
  boardToEdit,
  adminSecret,
}: AdminBoardModalProps) {
  const isEditing = Boolean(boardToEdit);

  const [title, setTitle] = useState(boardToEdit?.title || "");
  const [slug, setSlug] = useState(boardToEdit?.slug || "");
  const [description, setDescription] = useState(boardToEdit?.description || "");
  const [bannerNotes, setBannerNotes] = useState(boardToEdit?.bannerNotes || "");
  const [sortOrder, setSortOrder] = useState<BoardSortOrder>(boardToEdit?.sortOrder || "DESC");
  const [unitType, setUnitType] = useState<BoardUnitType>(boardToEdit?.unitType || "CURRENCY_IDR");
  const [customUnit, setCustomUnit] = useState(boardToEdit?.customUnit || "");
  const [status, setStatus] = useState<BoardStatus>(boardToEdit?.status || "ACTIVE");
  const [deadline, setDeadline] = useState(
    boardToEdit?.deadline ? boardToEdit.deadline.substring(0, 16) : ""
  );
  const [visibility, setVisibility] = useState<BoardVisibility>(
    boardToEdit?.visibility || "PUBLIC"
  );
  const [allowPublicSubmit, setAllowPublicSubmit] = useState(
    boardToEdit?.config?.allowPublicSubmit ?? true
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]/g, "-"))) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title,
        slug,
        description,
        bannerNotes,
        sortOrder,
        unitType,
        customUnit: unitType === "CUSTOM" ? customUnit : undefined,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        visibility,
        config: {
          enablePodium: true,
          maskIdentifiersByDefault: true,
          allowPublicSubmit,
        },
      };

      const url = isEditing ? `/api/boards/${boardToEdit!.slug}` : "/api/boards";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan papan");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              {isEditing ? "Edit Pengaturan Papan" : "Buat Papan Peringkat Baru"}
            </h3>
            <p className="text-xs text-slate-400">
              Konfigurasi tipe penilaian, format skor, status, dan deadline lelang
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Judul Papan <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: Lelang SubSecond Batch 11"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL Slug <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="lelang-subsecond-b11"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan tujuan atau ketentuan leaderboard..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Banner Notes / Disclaimer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Banner Catatan / Disclaimer Penting (Opsional)
            </label>
            <input
              type="text"
              placeholder="misal: Peringkat dikunci tepat pukul 23:59 WIB. Verifikasi manual admin."
              value={bannerNotes}
              onChange={(e) => setBannerNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sorting Logic & Unit Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Logika Pengurutan (Sorting)
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as BoardSortOrder)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="DESC">Tertinggi Pertama (DESC) - Lelang Rp, Skor</option>
                <option value="ASC">Terendah Pertama (ASC) - Catatan Waktu ms, Latensi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Format / Unit Nilai
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as BoardUnitType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="CURRENCY_IDR">Rupiah (Rp)</option>
                <option value="MILLISECONDS">Milidetik (ms)</option>
                <option value="SCORE">Angka / Skor Murni</option>
                <option value="CUSTOM">Custom Unit Text</option>
              </select>
            </div>
          </div>

          {unitType === "CUSTOM" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Unit Custom
              </label>
              <input
                type="text"
                placeholder="misal: pts / tiket / votes"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Status, Deadline, Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Papan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BoardStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ACTIVE">ACTIVE (Aktif)</option>
                <option value="LOCKED">LOCKED (Dikunci)</option>
                <option value="ARCHIVED">ARCHIVED (Arsip)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Visibilitas
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as BoardVisibility)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="PUBLIC">PUBLIC (Tampil)</option>
                <option value="UNLISTED">UNLISTED (Link Rahasia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Checkbox: Allow Public Submit */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="allowPublicSubmit"
              checked={allowPublicSubmit}
              onChange={(e) => setAllowPublicSubmit(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="allowPublicSubmit" className="text-xs text-slate-300">
              Izinkan publik mengajukan bid / submit entry secara mandiri (status awal PENDING)
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Simpan Perubahan" : "Buat Papan Sekarang"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
