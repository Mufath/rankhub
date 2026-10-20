"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining, TimeRemaining } from "@/lib/utils";
import { Clock, Lock, Sparkles } from "lucide-react";

interface CountdownTimerProps {
  deadline: string | null | undefined;
  status: "ACTIVE" | "LOCKED" | "ARCHIVED";
}

export function CountdownTimer({ deadline, status }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!deadline) return;

    setTimeLeft(getTimeRemaining(deadline));

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(deadline);
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!mounted) {
    return (
      <div className="h-14 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-500">
        Memuat timer countdown...
      </div>
    );
  }

  if (status === "LOCKED" || status === "ARCHIVED") {
    return (
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
        <Lock className="w-4 h-4 text-rose-400" />
        <span className="font-semibold text-sm">
          {status === "LOCKED" ? "LELANG DIKUNCI / SELESAI" : "DIARSIPKAN"}
        </span>
      </div>
    );
  }

  if (!deadline) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Tanpa Batas Waktu (Open Ended)</span>
      </div>
    );
  }

  if (timeLeft?.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300 text-sm font-semibold">
        <Clock className="w-4 h-4 text-amber-400" />
        <span>WAKTU HABIS (Menunggu Verifikasi & Kunci)</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <span>Cutoff Countdown</span>
      </div>

      <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
        {timeLeft && timeLeft.days > 0 && (
          <div className="flex flex-col p-2 bg-slate-900/90 border border-slate-800 rounded-xl min-w-[50px] shadow-sm">
            <span className="font-mono text-lg font-bold text-white">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Hari</span>
          </div>
        )}

        <div className="flex flex-col p-2 bg-slate-900/90 border border-slate-800 rounded-xl min-w-[50px] shadow-sm">
          <span className="font-mono text-lg font-bold text-white">
            {String(timeLeft?.hours ?? 0).padStart(2, "0")}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400">Jam</span>
        </div>

        <div className="flex flex-col p-2 bg-slate-900/90 border border-slate-800 rounded-xl min-w-[50px] shadow-sm">
          <span className="font-mono text-lg font-bold text-cyan-300">
            {String(timeLeft?.minutes ?? 0).padStart(2, "0")}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400">Menit</span>
        </div>

        <div className="flex flex-col p-2 bg-slate-900/90 border border-slate-800 rounded-xl min-w-[50px] shadow-sm">
          <span className="font-mono text-lg font-bold text-amber-300">
            {String(timeLeft?.seconds ?? 0).padStart(2, "0")}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400">Detik</span>
        </div>
      </div>
    </div>
  );
}
