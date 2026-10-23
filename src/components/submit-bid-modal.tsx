"use client";

import { useState } from "react";
import { PlusCircle, X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Board } from "@/types";

interface SubmitBidModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubmitBidModal({
  board,
  isOpen,
  onClose,
  onSuccess,
}: SubmitBidModalProps) {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [value, setValue] = useState("");
  const [telegram, setTelegram] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/boards/${board.slug}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          identifier: identifier.trim(),
          value: parseFloat(value),
          customMeta: {
            telegram: telegram.trim() || undefined,
            notes: notes.trim() || undefined,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengirim data");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName("");
        setIdentifier("");
        setValue("");
        setTelegram("");
        setNotes("");
        onSuccess();
        onClose();
      }, 1400);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getUnitHint = () => {
    switch (board.unitType) {
      case "CURRENCY_IDR":
        return "Contoh: 750000 (untuk Rp 750.000)";
      case "MILLISECONDS":
        return "Contoh: 45 (untuk 45 ms)";
      default:
        return "Masukkan nominal angka / skor";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF6E9] border border-white/90 rounded-[36px] max-w-md w-full p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.18)] relative overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-400 hover:text-gray-900 flex items-center justify-center border border-gray-200/80 transition-colors shadow-xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900 tracking-tight">
              Ikuti Lelang / Tambah Peserta
            </h3>
            <p className="text-xs text-gray-500 font-semibold truncate max-w-[260px]">
              {board.title}
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2.5">
            <div className="w-14 h-14 rounded-full bg-white border border-gray-200 text-gray-900 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
            </div>
            <h4 className="text-base font-extrabold text-gray-900">Entry Berhasil Diajukan!</h4>
            <p className="text-xs text-gray-600 font-medium">
              Data Anda telah masuk ke papan peringkat dengan status PENDING.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-2xl bg-white border border-rose-200 text-rose-700 text-xs font-semibold shadow-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nama Tampilan / Alias Publik <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: CyberSniper_99 atau Budi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/80 border border-amber-900/10 rounded-2xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Identifier Unik (NIM / Email / ID Telegram) <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: 21120120140088 (disensor di tampilan publik)"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/80 border border-amber-900/10 rounded-2xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nilai Tawaran / Skor ({board.unitType}) <span className="text-amber-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder={getUnitHint()}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/80 border border-amber-900/10 rounded-2xl text-xs font-mono font-bold text-amber-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Kontak Telegram (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-amber-900/10 rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Ref Transfer BCA"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-amber-900/10 rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
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
                    <span>Kirim Penawaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
