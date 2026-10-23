"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Layers,
  ChevronDown,
  Check,
  Calendar,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Board, BoardSortOrder, BoardUnitType, BoardStatus, BoardVisibility } from "@/types";

interface AdminBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  boardToEdit?: Board | null;
  adminSecret: string;
}

/* Custom Apple Select Dropdown */
function AppleSelect<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; sub?: string }[];
  onChange: (val: T) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative">
      {label && <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2.5 bg-white/90 border border-amber-900/15 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400/40 font-semibold flex items-center justify-between shadow-xs hover:bg-white transition-all cursor-pointer"
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
            open ? "rotate-180 text-amber-600" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-2xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between text-left transition-colors cursor-pointer ${
                  opt.value === value
                    ? "bg-amber-100/80 text-amber-950 font-bold"
                    : "text-gray-700 hover:bg-amber-50 hover:text-amber-900"
                }`}
              >
                <div>
                  <div>{opt.label}</div>
                  {opt.sub && (
                    <div className="text-[10px] text-gray-400 font-normal">{opt.sub}</div>
                  )}
                </div>
                {opt.value === value && <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
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
  // Point 5: Anti-Sniping & Webhooks
  const [enableAntiSniping, setEnableAntiSniping] = useState(
    boardToEdit?.config?.enableAntiSniping ?? true
  );
  const [antiSnipingThresholdSec, setAntiSnipingThresholdSec] = useState(
    boardToEdit?.config?.antiSnipingThresholdSec ?? 60
  );
  const [antiSnipingExtensionSec, setAntiSnipingExtensionSec] = useState(
    boardToEdit?.config?.antiSnipingExtensionSec ?? 120
  );
  const [webhookUrl, setWebhookUrl] = useState(
    boardToEdit?.config?.webhookUrl || ""
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

  // Quick preset deadline buttons
  const setPresetDeadline = (hoursFromNow: number | null) => {
    if (hoursFromNow === null) {
      setDeadline("");
      return;
    }
    const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    // Format YYYY-MM-DDTHH:mm local
    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
    setDeadline(formatted);
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
          enableAntiSniping,
          antiSnipingThresholdSec: Number(antiSnipingThresholdSec) || 60,
          antiSnipingExtensionSec: Number(antiSnipingExtensionSec) || 120,
          webhookUrl: webhookUrl.trim() || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#FAF6E9] border border-white/90 rounded-[36px] max-w-xl w-full p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.18)] relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-400 hover:text-gray-900 flex items-center justify-center border border-gray-200/80 transition-colors shadow-xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900 tracking-tight">
              {isEditing ? "Edit Pengaturan Papan" : "Buat Papan Peringkat Baru"}
            </h3>
            <p className="text-xs text-gray-500 font-semibold">
              Konfigurasi tipe penilaian, format skor, status, dan countdown lelang
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-white border border-rose-200 text-rose-700 text-xs font-semibold shadow-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Judul Papan <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: Lelang SubSecond Batch 11"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-amber-900/15 rounded-2xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 font-semibold transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                URL Slug <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="lelang-subsecond-b11"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-amber-900/15 rounded-2xl text-xs font-mono font-bold text-amber-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan tujuan atau ketentuan leaderboard..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/90 border border-amber-900/15 rounded-2xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-amber-500 transition-all shadow-xs"
            />
          </div>

          {/* Banner Notes / Disclaimer */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Banner Catatan / Disclaimer Penting (Opsional)
            </label>
            <input
              type="text"
              placeholder="misal: Peringkat dikunci tepat pukul 23:59 WIB. Verifikasi manual admin."
              value={bannerNotes}
              onChange={(e) => setBannerNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white/90 border border-amber-900/15 rounded-2xl text-xs text-amber-950 font-medium placeholder-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all shadow-xs"
            />
          </div>

          {/* Apple Custom Dropdowns: Sorting Logic & Unit Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AppleSelect<BoardSortOrder>
              label="Tipe Pengurutan (Sorting Logic)"
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: "DESC", label: "Highest First (Desc)", sub: "Lelang Harga Tertinggi / Skor" },
                { value: "ASC", label: "Lowest First (Asc)", sub: "Latency Tercepat (ms) / Waktu" },
              ]}
            />

            <AppleSelect<BoardUnitType>
              label="Format Satuan Nilai (Unit)"
              value={unitType}
              onChange={setUnitType}
              options={[
                { value: "CURRENCY_IDR", label: "Rupiah (Rp)", sub: "Format Mata Uang IDR" },
                { value: "MILLISECONDS", label: "Milidetik (ms)", sub: "Format Latensi Waktu" },
                { value: "SCORE", label: "Angka / Skor Biasa", sub: "Poin Turnamen" },
                { value: "CUSTOM", label: "Custom Satuan", sub: "Label Kustom Tertentu" },
              ]}
            />
          </div>

          {unitType === "CUSTOM" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Label Satuan Kustom
              </label>
              <input
                type="text"
                placeholder="misal: poin, vote, tiket"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-amber-900/15 rounded-2xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-amber-500 transition-all shadow-xs"
              />
            </div>
          )}

          {/* Apple Custom Dropdowns: Status & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AppleSelect<BoardStatus>
              label="Status Board"
              value={status}
              onChange={setStatus}
              options={[
                { value: "ACTIVE", label: "ACTIVE (Bisa Ditawar / Live)", sub: "Peserta dapat berpartisipasi" },
                { value: "LOCKED", label: "LOCKED (Dikunci Final)", sub: "Urutan dibekukan / selesai" },
                { value: "ARCHIVED", label: "ARCHIVED (Arsip)", sub: "Hanya tersimpan di arsip" },
              ]}
            />

            <AppleSelect<BoardVisibility>
              label="Visibilitas"
              value={visibility}
              onChange={setVisibility}
              options={[
                { value: "PUBLIC", label: "PUBLIC (Tampil di Beranda)", sub: "Bisa dilihat semua orang" },
                { value: "UNLISTED", label: "UNLISTED (Hanya yang Punya Link)", sub: "Tersembunyi dari beranda" },
              ]}
            />
          </div>

          {/* Apple Style Date & Time Selector with Quick Presets */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-900/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Target Deadline / Countdown Timer</span>
              </label>
              {deadline && (
                <button
                  type="button"
                  onClick={() => setDeadline("")}
                  className="text-[10px] text-gray-400 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Hapus Deadline</span>
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-gray-400 font-semibold mr-1">Preset Cepat:</span>
              <button
                type="button"
                onClick={() => setPresetDeadline(2)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-amber-100 text-gray-700 border border-gray-200 transition-colors shadow-2xs cursor-pointer"
              >
                +2 Jam
              </button>
              <button
                type="button"
                onClick={() => setPresetDeadline(24)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-amber-100 text-gray-700 border border-gray-200 transition-colors shadow-2xs cursor-pointer"
              >
                +24 Jam (Besok)
              </button>
              <button
                type="button"
                onClick={() => setPresetDeadline(72)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-amber-100 text-gray-700 border border-gray-200 transition-colors shadow-2xs cursor-pointer"
              >
                +3 Hari
              </button>
              <button
                type="button"
                onClick={() => setPresetDeadline(168)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-amber-100 text-gray-700 border border-gray-200 transition-colors shadow-2xs cursor-pointer"
              >
                +1 Minggu
              </button>
            </div>

            {/* Formatted Date & Time input */}
            <div className="relative">
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>

          {/* iOS-Style Toggle Switch for Public Submit */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 border border-amber-900/10">
            <div>
              <div className="text-xs font-bold text-gray-900">
                Bolehkan Publik Mengirim Penawaran Mandiri
              </div>
              <div className="text-[11px] text-gray-500 font-medium">
                Pengunjung umum dapat memasukkan entry lewat modal beranda
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAllowPublicSubmit(!allowPublicSubmit)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative cursor-pointer shrink-0 ${
                allowPublicSubmit ? "bg-[#E8890C]" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  allowPublicSubmit ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Point 5: Anti-Sniping Dynamic Soft Close Setting */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-900/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>⚡ Anti-Sniping (Soft Close)</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    Point 5
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  Perpanjang deadline otomatis jika ada bid di detik-detik terakhir
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnableAntiSniping(!enableAntiSniping)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 relative cursor-pointer shrink-0 ${
                  enableAntiSniping ? "bg-[#E8890C]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    enableAntiSniping ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {enableAntiSniping && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Threshold Pemicu (Detik)
                  </label>
                  <input
                    type="number"
                    value={antiSnipingThresholdSec}
                    onChange={(e) => setAntiSnipingThresholdSec(Number(e.target.value))}
                    min={10}
                    max={600}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="60"
                  />
                  <span className="text-[10px] text-gray-400">Default: 60 detik (1 menit)</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Perpanjangan Waktu (Detik)
                  </label>
                  <input
                    type="number"
                    value={antiSnipingExtensionSec}
                    onChange={(e) => setAntiSnipingExtensionSec(Number(e.target.value))}
                    min={30}
                    max={1800}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="120"
                  />
                  <span className="text-[10px] text-gray-400">Default: 120 detik (+2 menit)</span>
                </div>
              </div>
            )}
          </div>

          {/* Point 5: Webhook Dispatcher URL */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-900/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>Webhook Bot / Discord Integration</span>
                <span className="text-[10px] font-bold text-gray-400">Opsional</span>
              </label>
            </div>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/... atau https://worker.your-bot.com"
              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
            <div className="text-[10px] text-gray-500">
              Menerima sinyal event otomatis: <code>bid.created</code>, <code>rank.outbid</code>, <code>board.deadline_extended</code>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-black/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-[#E8890C] hover:from-amber-600 hover:to-[#d47c09] text-white shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Simpan Perubahan" : "Buat Papan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
