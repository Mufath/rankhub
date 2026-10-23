"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, UserPlus, UserCheck, ChevronDown, Check } from "lucide-react";
import { Board, Participant, ParticipantStatus } from "@/types";

interface AdminParticipantModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  participantToEdit?: Participant | null;
  adminSecret: string;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#FAF6E9] border border-white/90 rounded-[36px] max-w-md w-full p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.18)] relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-400 hover:text-gray-900 flex items-center justify-center border border-gray-200/80 transition-colors shadow-xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            {isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900 tracking-tight">
              {isEditing ? "Edit Data Peserta" : "Tambah Peserta Manual"}
            </h3>
            <p className="text-xs text-gray-500 font-semibold truncate max-w-[260px]">
              Papan: {board.title}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-white border border-rose-200 text-rose-700 text-xs font-semibold shadow-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Tampilan / Alias <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="misal: CyberSniper_99 atau Budi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/90 border border-amber-900/15 rounded-2xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 font-semibold transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Identifier Unik (NIM / Email / ID) <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="misal: 21120120140088"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/90 border border-amber-900/15 rounded-2xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nilai / Skor ({board.unitType}) <span className="text-amber-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="misal: 750000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-amber-900/15 rounded-2xl text-xs font-mono font-bold text-amber-900 focus:outline-none focus:bg-white focus:border-amber-500 transition-all shadow-xs"
              />
            </div>

            <AppleSelect<ParticipantStatus>
              label="Status Pembayaran"
              value={status}
              onChange={setStatus}
              options={[
                { value: "VERIFIED", label: "VERIFIED (Lunas)", sub: "Masuk antrean bot live" },
                { value: "PENDING", label: "PENDING (Menunggu)", sub: "Menunggu bukti bayar" },
                { value: "DISQUALIFIED", label: "DISQUALIFIED", sub: "Didiskualifikasi" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Delay Offset ms
              </label>
              <input
                type="number"
                placeholder="misal: 0 atau 15"
                value={delayOffsetMs}
                onChange={(e) => setDelayOffsetMs(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-amber-900/15 rounded-2xl text-xs font-mono text-gray-800 focus:outline-none focus:bg-white focus:border-amber-500 transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Kontak Telegram
              </label>
              <input
                type="text"
                placeholder="@username"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-amber-900/15 rounded-2xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-amber-500 transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Catatan Internal Admin (Opsional)
            </label>
            <input
              type="text"
              placeholder="misal: Transfer via BCA ref #88921"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white/90 border border-amber-900/15 rounded-2xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-amber-500 transition-all shadow-xs"
            />
          </div>

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
                  <span>{isEditing ? "Simpan Perubahan" : "Tambah Peserta"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
