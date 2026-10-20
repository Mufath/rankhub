"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, UserPlus, UserCheck } from "lucide-react";
import { Board, Participant, ParticipantStatus } from "@/types";

interface AdminParticipantModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  participantToEdit?: Participant | null;
  adminSecret: string;
}

export function AdminParticipantModal({
  board,
  isOpen,
  onClose,
  onSaved,
  participantToEdit,
  adminSecret,
}: AdminParticipantModalProps) {
  const isEditing = Boolean(participantToEdit);

  const [name, setName] = useState(participantToEdit?.name || "");
  const [identifier, setIdentifier] = useState(participantToEdit?.identifier || "");
  const [value, setValue] = useState(participantToEdit?.value?.toString() || "");
  const [status, setStatus] = useState<ParticipantStatus>(
    participantToEdit?.status || "VERIFIED"
  );
  const [delayOffsetMs, setDelayOffsetMs] = useState(
    (participantToEdit?.customMeta as { delayOffsetMs?: number })?.delayOffsetMs?.toString() || ""
  );
  const [telegram, setTelegram] = useState(
    (participantToEdit?.customMeta as { telegram?: string })?.telegram || ""
  );
  const [notes, setNotes] = useState(
    (participantToEdit?.customMeta as { notes?: string })?.notes || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        id: participantToEdit?.id,
        name: name.trim(),
        identifier: identifier.trim(),
        value: parseFloat(value),
        status,
        customMeta: {
          delayOffsetMs: delayOffsetMs ? parseInt(delayOffsetMs) : undefined,
          telegram: telegram.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      };

      const url = `/api/boards/${board.slug}/participants`;
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
        throw new Error(json.error || "Gagal menyimpan data peserta");
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            {isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {isEditing ? "Edit Data Peserta" : "Tambah Peserta Manual"}
            </h3>
            <p className="text-xs text-slate-400">Papan: {board.title}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama / Alias Tampilan <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="misal: FastSniper_01"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Identifier Unik (NIM / Email / ID Telegram) <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="misal: 21120120140088"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nilai / Tawaran <span className="text-cyan-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="misal: 350000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Pembayaran / Entri
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ParticipantStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="VERIFIED">VERIFIED / PAID (Lunas)</option>
                <option value="PENDING">PENDING (Menunggu)</option>
                <option value="DISQUALIFIED">DISQUALIFIED (Batal)</option>
              </select>
            </div>
          </div>

          {/* Subsecond & Bot Meta */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Metadata Bot & Antrean
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Delay Offset (ms)
                </label>
                <input
                  type="number"
                  placeholder="0, 15, 30..."
                  value={delayOffsetMs}
                  onChange={(e) => setDelayOffsetMs(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Telegram Username
                </label>
                <input
                  type="text"
                  placeholder="@handle"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Catatan Verifikasi Admin
              </label>
              <input
                type="text"
                placeholder="misal: Mutasi BCA Valid, TF via QRIS"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Simpan Perubahan" : "Tambahkan Peserta"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
