"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Crown, Sparkles, Star, Shield, Droplets, Zap } from "lucide-react";
import { BoardUnitType, Participant } from "@/types";
import { formatScore, maskIdentifier } from "@/lib/utils";
import { getParticipantAvatar } from "@/lib/avatar-helper";

interface PodiumProps {
  participants: Participant[];
  unitType: BoardUnitType;
  customUnit?: string;
  isMasked: boolean;
  onParticipantClick?: (participant: Participant) => void;
}

export function Podium({
  participants,
  unitType,
  customUnit,
  isMasked,
  onParticipantClick,
}: PodiumProps) {
  const top1 = participants[0];
  const top2 = participants[1];
  const top3 = participants[2];

  useEffect(() => {
    if (top1) {
      const timer = setTimeout(() => {
        try {
          confetti({
            particleCount: 40,
            spread: 65,
            origin: { y: 0.55 },
            colors: ["#FFD700", "#FF9E1B", "#38BDF8", "#10B981"],
            disableForReducedMotion: true,
          });
        } catch {
          // ignore
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [top1?.id]);

  const triggerConfetti = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      confetti({
        particleCount: 80,
        spread: 85,
        origin: { y: 0.5 },
        colors: ["#FFD700", "#FFA500", "#38BDF8", "#EC4899"],
      });
    } catch {
      // ignore
    }
  };

  if (participants.length === 0) {
    return null;
  }

  return (
    <section
      className="ambient-glow pt-4 pb-8 px-2 rounded-3xl relative overflow-visible"
      data-purpose="leaderboard-podium"
    >
      {/* 3D Stepped Podium Container: 2nd (Left, mid-tall), 1st (Center, tallest), 3rd (Right, solid step) */}
      <div
        className="grid grid-cols-3 max-w-2xl mx-auto items-end pt-8 pb-4 relative z-10"
        data-purpose="podium-avatars"
      >
        {/* =========================================================
            2ND PLACE PODIUM (Left, Medium Height: h-36 md:h-40)
            ========================================================= */}
        <div
          id="podium-col-2"
          onClick={() => top2 && onParticipantClick?.(top2)}
          className="podium-card flex flex-col items-center text-center z-10 -mr-2 sm:-mr-3 relative cursor-pointer"
          data-player={top2?.name || "Rank 2"}
        >
          {top2 ? (
            <>
              {/* Floating Tooltip Popover (Apple VisionOS / Frosted Glass Style) */}
              <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-950/90 text-white rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-xl z-40 whitespace-nowrap text-left border border-white/20">
                <div className="text-[10px] text-sky-300 font-semibold uppercase tracking-wider">
                  Rank #2 • {top2.status === "VERIFIED" ? "Verified" : "Pending"}
                </div>
                <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                  <span className="text-slate-300">
                    ID: {maskIdentifier(top2.identifier, isMasked)}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="text-amber-400">
                    {formatScore(top2.value, unitType, customUnit)}
                  </span>
                </div>
              </div>

              {/* Avatar & Badge with subtle float */}
              <div className="relative mb-2 flex flex-col items-center floating-anim-2">
                <div className="avatar-ring w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-b from-sky-200 to-blue-500 shadow-xl transition-transform">
                  <img
                    alt={top2.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                    src={getParticipantAvatar(top2, 1)}
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-md">
                  <Droplets className="w-3 h-3 text-white fill-white" />
                </span>
              </div>

              {/* Name & XP Capsule */}
              <h3 className="font-extrabold text-sm md:text-base text-white tracking-tight truncate max-w-[120px]">
                {top2.name}
              </h3>
              <span className="inline-block mt-1 bg-black/90 text-white font-bold text-[11px] px-3 py-0.5 rounded-full shadow-lg border border-white/10">
                {formatScore(top2.value, unitType, customUnit)}
              </span>

              {/* 3D Silver Medal sitting on podium rim */}
              <div className="relative z-20 mt-3 -mb-5 flex justify-center">
                <div className="w-11 h-11 sm:w-12 sm:h-12 medal-3d medal-3d-silver ribbon-silver flex items-center justify-center text-slate-700">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 fill-slate-500 drop-shadow-sm" />
                </div>
              </div>

              {/* 3D Cylindrical Pedestal (Silver Apple Finish) */}
              <div className="relative w-full px-1">
                <div className="cylinder-base cylinder-base-silver w-full h-36 md:h-40">
                  <div className="cylinder-cap-silver"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-36 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-3xl">
              Posisi #2 Kosong
            </div>
          )}
        </div>

        {/* =========================================================
            1ST PLACE PODIUM (Center, Tallest: h-48 md:h-52)
            ========================================================= */}
        <div
          id="podium-col-1"
          onClick={(e) => {
            triggerConfetti(e);
            if (top1) onParticipantClick?.(top1);
          }}
          className="podium-card flex flex-col items-center text-center z-20 relative cursor-pointer"
          data-player={top1?.name || "Rank 1"}
        >
          {top1 ? (
            <>
              {/* Floating Tooltip Popover (Apple VisionOS / Frosted Glass Style) */}
              <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-950/95 text-white rounded-2xl py-1.5 px-4 shadow-2xl backdrop-blur-xl z-40 whitespace-nowrap text-left border border-amber-400/50">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Champion #1 • Highest Priority
                </div>
                <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                  <span className="text-slate-300">
                    ID: {maskIdentifier(top1.identifier, isMasked)}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="text-amber-400">
                    {formatScore(top1.value, unitType, customUnit)}
                  </span>
                </div>
              </div>

              {/* Avatar & Crown with Shimmer / Float */}
              <div className="relative mb-2 flex flex-col items-center floating-anim-1">
                <div className="avatar-ring w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 shadow-2xl ring-4 ring-amber-400/50 transition-transform">
                  <img
                    alt={top1.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
                    src={getParticipantAvatar(top1, 0)}
                  />
                </div>
                <span className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-xs shadow-lg shimmer-active">
                  <Crown className="w-3.5 h-3.5 text-yellow-100 fill-yellow-200" />
                </span>
              </div>

              {/* Name & XP / Score Capsule */}
              <h3 className="font-extrabold text-base md:text-lg text-white tracking-tight truncate max-w-[140px]">
                {top1.name}
              </h3>
              <span className="inline-block mt-1 bg-black/90 text-amber-400 font-extrabold text-xs px-4 py-0.5 rounded-full shadow-xl border border-amber-500/40">
                {formatScore(top1.value, unitType, customUnit)}
              </span>

              {/* 3D Gold Medal sitting on podium rim */}
              <div className="relative z-20 mt-3 -mb-6 flex justify-center shimmer-active">
                <div className="w-13 h-13 sm:w-14 sm:h-14 medal-3d medal-3d-gold ribbon-gold flex items-center justify-center text-amber-900">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800 fill-amber-700 drop-shadow-sm" />
                </div>
              </div>

              {/* 3D Cylindrical Pedestal (Brushed Champagne Gold Finish) */}
              <div className="relative w-full px-0">
                <div className="cylinder-base cylinder-base-gold w-full h-48 md:h-52">
                  <div className="cylinder-cap-gold"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-3xl">
              Posisi #1 Kosong
            </div>
          )}
        </div>

        {/* =========================================================
            3RD PLACE PODIUM (Right, Balanced Step Height: h-28 md:h-32)
            ========================================================= */}
        <div
          id="podium-col-3"
          onClick={() => top3 && onParticipantClick?.(top3)}
          className="podium-card flex flex-col items-center text-center z-10 -ml-2 sm:-ml-3 relative cursor-pointer"
          data-player={top3?.name || "Rank 3"}
        >
          {top3 ? (
            <>
              {/* Floating Tooltip Popover (Apple VisionOS / Frosted Glass Style) */}
              <div className="stat-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-950/90 text-white rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-xl z-40 whitespace-nowrap text-left border border-orange-400/40">
                <div className="text-[10px] text-orange-300 font-semibold uppercase tracking-wider">
                  Rank #3 • {top3.status === "VERIFIED" ? "Verified" : "Pending"}
                </div>
                <div className="text-xs font-bold flex items-center gap-2 mt-0.5">
                  <span className="text-slate-300">
                    ID: {maskIdentifier(top3.identifier, isMasked)}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="text-amber-400">
                    {formatScore(top3.value, unitType, customUnit)}
                  </span>
                </div>
              </div>

              {/* Avatar & Shield Badge with subtle float */}
              <div className="relative mb-2 flex flex-col items-center floating-anim-3">
                <div className="avatar-ring w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-b from-orange-300 to-amber-700 shadow-xl transition-transform">
                  <img
                    alt={top3.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                    src={getParticipantAvatar(top3, 2)}
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-md">
                  <Shield className="w-3 h-3 text-white fill-white" />
                </span>
              </div>

              {/* Name & XP Capsule */}
              <h3 className="font-extrabold text-sm md:text-base text-white tracking-tight truncate max-w-[120px]">
                {top3.name}
              </h3>
              <span className="inline-block mt-1 bg-black/90 text-white font-bold text-[11px] px-3 py-0.5 rounded-full shadow-lg border border-white/10">
                {formatScore(top3.value, unitType, customUnit)}
              </span>

              {/* 3D Bronze Medal sitting on podium rim */}
              <div className="relative z-20 mt-3 -mb-5 flex justify-center">
                <div className="w-11 h-11 sm:w-12 sm:h-12 medal-3d medal-3d-bronze ribbon-bronze flex items-center justify-center text-orange-950">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950/80 fill-amber-900 drop-shadow-sm" />
                </div>
              </div>

              {/* 3D Cylindrical Pedestal (Rose Titanium / Bronze Finish) */}
              <div className="relative w-full px-1">
                <div className="cylinder-base cylinder-base-bronze w-full h-28 md:h-32">
                  <div className="cylinder-cap-bronze"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-28 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-3xl">
              Posisi #3 Kosong
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
