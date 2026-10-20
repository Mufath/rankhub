"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Award, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { BoardUnitType, Participant } from "@/types";
import { formatScore, maskIdentifier } from "@/lib/utils";

interface PodiumProps {
  participants: Participant[];
  unitType: BoardUnitType;
  customUnit?: string;
  isMasked: boolean;
}

export function Podium({ participants, unitType, customUnit, isMasked }: PodiumProps) {
  // Only take top 3
  const top1 = participants[0];
  const top2 = participants[1];
  const top3 = participants[2];

  useEffect(() => {
    // Subtle initial celebration if there is a top 1
    if (top1) {
      const timer = setTimeout(() => {
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#38bdf8", "#eab308", "#10b981"],
            disableForReducedMotion: true,
          });
        } catch {
          // ignore
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [top1?.id]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#ffd700", "#38bdf8", "#a855f7"],
      });
    } catch {
      // ignore
    }
  };

  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-6 p-6 rounded-2xl glass-panel relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-amber-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Top 3 Highflyers
          </h3>
          <p className="text-xs text-slate-400">
            Peserta posisi teratas klasemen saat ini
          </p>
        </div>
        <button
          onClick={triggerConfetti}
          type="button"
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Rayakan</span>
        </button>
      </div>

      {/* Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto pt-6">
        {/* RANK 2 - SILVER (Left on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="order-2 md:order-1 flex flex-col items-center"
        >
          {top2 ? (
            <div className="w-full flex flex-col items-center">
              {/* Avatar & Rank badge */}
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 glow-silver shadow-lg">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex flex-col items-center justify-center">
                    <Medal className="w-7 h-7 text-slate-300" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-md">
                  #2
                </div>
              </div>

              {/* Participant info */}
              <div className="text-center w-full px-2">
                <h4 className="font-bold text-slate-200 text-sm truncate" title={top2.name}>
                  {top2.name}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  {maskIdentifier(top2.identifier, isMasked)}
                </p>
              </div>

              {/* Pillar Stand */}
              <div className="w-full mt-3 p-4 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/70 text-center md:h-36 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Perak (Silver)
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-slate-100 mt-1">
                  {formatScore(top2.value, unitType, customUnit)}
                </span>
                {top2.status === "VERIFIED" ? (
                  <span className="mt-2 inline-flex items-center justify-center text-[10px] text-emerald-400 font-semibold">
                    ✓ Terverifikasi
                  </span>
                ) : (
                  <span className="mt-2 inline-flex items-center justify-center text-[10px] text-amber-400 font-semibold">
                    ⏳ Menunggu Bayar
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full p-6 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl md:h-36 flex items-center justify-center">
              Posisi #2 Kosong
            </div>
          )}
        </motion.div>

        {/* RANK 1 - GOLD (Center - Highest) */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="order-1 md:order-2 flex flex-col items-center -mt-4 md:-mt-6"
        >
          {top1 ? (
            <div className="w-full flex flex-col items-center">
              {/* Crown & Gold Avatar */}
              <div className="relative mb-3 cursor-pointer group" onClick={triggerConfetti}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-0.5 glow-gold shadow-xl group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                    <Crown className="w-9 h-9 text-amber-400 animate-pulse" />
                  </div>
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-lg tracking-wider">
                  JUARA 1
                </div>
                <div className="absolute -bottom-2 -right-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                  #1
                </div>
              </div>

              {/* Participant info */}
              <div className="text-center w-full px-2">
                <h4 className="font-extrabold text-amber-300 text-base truncate" title={top1.name}>
                  {top1.name}
                </h4>
                <p className="text-xs font-mono text-slate-400 truncate">
                  {maskIdentifier(top1.identifier, isMasked)}
                </p>
              </div>

              {/* Pillar Stand */}
              <div className="w-full mt-3 p-4 rounded-xl bg-gradient-to-b from-amber-500/20 via-slate-800/90 to-slate-950 border border-amber-500/50 text-center md:h-48 flex flex-col justify-center shadow-lg shadow-amber-500/10">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Puncak Klasemen
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 mt-1">
                  {formatScore(top1.value, unitType, customUnit)}
                </span>
                {top1.status === "VERIFIED" ? (
                  <span className="mt-2 inline-flex items-center justify-center text-[11px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 mx-auto">
                    ✓ Prioritas Teratas
                  </span>
                ) : (
                  <span className="mt-2 inline-flex items-center justify-center text-[11px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 mx-auto">
                    ⏳ Belum Terverifikasi
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full p-6 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl md:h-48 flex items-center justify-center">
              Posisi #1 Kosong
            </div>
          )}
        </motion.div>

        {/* RANK 3 - BRONZE (Right on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="order-3 flex flex-col items-center"
        >
          {top3 ? (
            <div className="w-full flex flex-col items-center">
              {/* Avatar & Rank badge */}
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 p-0.5 glow-bronze shadow-lg">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex flex-col items-center justify-center">
                    <Medal className="w-7 h-7 text-amber-600" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-amber-600 text-white font-black text-xs shadow-md">
                  #3
                </div>
              </div>

              {/* Participant info */}
              <div className="text-center w-full px-2">
                <h4 className="font-bold text-slate-200 text-sm truncate" title={top3.name}>
                  {top3.name}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  {maskIdentifier(top3.identifier, isMasked)}
                </p>
              </div>

              {/* Pillar Stand */}
              <div className="w-full mt-3 p-4 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/70 text-center md:h-28 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-wider text-amber-600 font-medium">
                  Perunggu (Bronze)
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-slate-100 mt-1">
                  {formatScore(top3.value, unitType, customUnit)}
                </span>
                {top3.status === "VERIFIED" ? (
                  <span className="mt-2 inline-flex items-center justify-center text-[10px] text-emerald-400 font-semibold">
                    ✓ Terverifikasi
                  </span>
                ) : (
                  <span className="mt-2 inline-flex items-center justify-center text-[10px] text-amber-400 font-semibold">
                    ⏳ Menunggu Bayar
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full p-6 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl md:h-28 flex items-center justify-center">
              Posisi #3 Kosong
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
