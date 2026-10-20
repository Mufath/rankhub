"use client";

import { useState, useMemo, useRef } from "react";
import {
  Search,
  X,
  Crown,
  Droplets,
  Shield,
  Zap,
  Ribbon,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Ban,
  Sparkles,
} from "lucide-react";
import { BoardUnitType, Participant, ParticipantStatus } from "@/types";
import { formatScore, maskIdentifier } from "@/lib/utils";
import {
  getParticipantAvatar,
  getParticipantDeckOrSubtitle,
  getParticipantTierTitle,
} from "@/lib/avatar-helper";

interface LeaderboardTableProps {
  participants: Participant[];
  unitType: BoardUnitType;
  customUnit?: string;
  defaultMasked?: boolean;
  onSelectParticipant?: (participant: Participant) => void;
}

export function LeaderboardTable({
  participants,
  unitType,
  customUnit,
  defaultMasked = true,
  onSelectParticipant,
}: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isMasked, setIsMasked] = useState(defaultMasked);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.identifier.toLowerCase().includes(q) ||
          JSON.stringify(p.customMeta || {}).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [participants, statusFilter, searchQuery]);

  const copyToClipboard = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRowClick = (p: Participant) => {
    setSelectedId(p.id);
    onSelectParticipant?.(p);

    // Trigger visual feedback on corresponding podium column if top 3
    if (p.rank && p.rank <= 3) {
      const el = document.getElementById(`podium-col-${p.rank}`);
      if (el) {
        el.classList.add("-translate-y-3");
        setTimeout(() => el.classList.remove("-translate-y-3"), 600);
      }
    }
  };

  const getRankBadgeClasses = (rank?: number) => {
    if (rank === 1) {
      return "border-amber-400 bg-amber-400/20 text-amber-300 shadow-sm shadow-amber-400/20";
    }
    if (rank === 2) {
      return "border-slate-300 bg-slate-300/20 text-slate-200 shadow-sm";
    }
    if (rank === 3) {
      return "border-orange-400 bg-orange-400/20 text-orange-300 shadow-sm";
    }
    return "border-white/10 bg-white/5 text-slate-400";
  };

  const getMicroBadgeIcon = (rank?: number) => {
    if (rank === 1) {
      return (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center border border-white shadow-sm">
          <Crown className="w-2.5 h-2.5 text-white fill-white" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center border border-white shadow-sm">
          <Droplets className="w-2.5 h-2.5 text-white fill-white" />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center border border-white shadow-sm">
          <Shield className="w-2.5 h-2.5 text-white fill-white" />
        </span>
      );
    }
    return (
      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center border border-white/40 shadow-sm">
        <Zap className="w-2.5 h-2.5 text-cyan-300" />
      </span>
    );
  };

  return (
    <div className="w-full space-y-4" data-purpose="leaderboard-ranking-list">
      {/* =========================================================
          APPLE SEGMENTED CONTROLS & SEARCH BAR
          ========================================================= */}
      <div
        className="flex items-center justify-between mb-3 flex-wrap gap-3"
        data-purpose="filter-toggle"
      >
        {/* Apple Segmented Pill Switcher */}
        <div className="relative bg-slate-900/90 border border-white/10 p-1 rounded-full flex text-xs font-bold text-slate-400 shadow-inner">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`relative z-10 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                : "hover:text-white"
            }`}
          >
            Semua ({participants.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("VERIFIED")}
            className={`relative z-10 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              statusFilter === "VERIFIED"
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                : "hover:text-white"
            }`}
          >
            Lunas / Verified
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className={`relative z-10 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              statusFilter === "PENDING"
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                : "hover:text-white"
            }`}
          >
            Pending
          </button>
        </div>

        {/* Right Tools: Apple Search Input & Mask Toggle */}
        <div className="flex items-center gap-2">
          {/* Apple Search Pill Input */}
          <div className="flex items-center gap-2 bg-slate-900/80 focus-within:bg-slate-900 border border-white/10 rounded-full px-3.5 py-1.5 shadow-sm transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 border-none outline-none focus:ring-0 p-0 w-28 sm:w-40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Privacy Mask Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMasked(!isMasked)}
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all cursor-pointer shadow-sm"
            title="Sensor / Tampilkan NIM"
          >
            {isMasked ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Lihat NIM</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Sensor NIM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================
          APPLE FROSTED GLASS RANKING PILL ROWS
          ========================================================= */}
      <section className="mt-2 space-y-2.5 relative z-10" id="leaderboard-list">
        {filteredParticipants.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-[32px] border border-white/10 text-slate-400">
            <p className="text-sm font-semibold">Tidak ada peserta yang cocok dengan pencarian.</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci atau pilih tab filter lain.</p>
          </div>
        ) : (
          filteredParticipants.map((p, index) => {
            const avatarUrl = getParticipantAvatar(p, index);
            const deckSubtitle = getParticipantDeckOrSubtitle(p);
            const tierTitle = getParticipantTierTitle(p);
            const isSelected = selectedId === p.id;

            return (
              <article
                key={p.id}
                onClick={() => handleRowClick(p)}
                className={`ranking-pill-row rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between cursor-pointer group transition-all ${
                  isSelected
                    ? "ring-2 ring-amber-400 bg-white/15 dark:bg-white/15"
                    : ""
                }`}
                data-name={p.name}
                data-purpose="rank-row"
              >
                {/* Left: Rank, Avatar, Name & Subtitle */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Rank Number Circle */}
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full border font-extrabold text-xs flex items-center justify-center transition-colors ${getRankBadgeClasses(
                      p.rank
                    )}`}
                  >
                    {p.rank || index + 1}
                  </span>

                  {/* Avatar & Element Micro-Badge */}
                  <div className="relative shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      alt={p.name}
                      src={avatarUrl}
                      className={`w-10 h-10 rounded-full object-cover border-2 shadow-sm ${
                        p.rank === 1
                          ? "border-amber-400"
                          : p.rank === 2
                          ? "border-blue-400"
                          : p.rank === 3
                          ? "border-orange-400"
                          : "border-slate-700"
                      }`}
                    />
                    {getMicroBadgeIcon(p.rank)}
                  </div>

                  {/* Name, Deck Info & Masked Identifier */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white leading-tight group-hover:text-amber-300 transition-colors truncate">
                        {p.name}
                      </h4>
                      {p.rank === 1 && (
                        <span className="hidden md:inline text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
                          LEADER
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {deckSubtitle}
                      </p>
                      <span className="text-slate-600 hidden sm:inline">•</span>
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                        {maskIdentifier(p.identifier, isMasked)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => copyToClipboard(e, p.identifier, p.id)}
                        className="text-slate-500 hover:text-amber-400 transition-colors p-0.5"
                        title="Salin identifier"
                      >
                        {copiedId === p.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Center: Tier Status Badge (Apple style ribbon) */}
                <div className="hidden md:flex items-center gap-2 shrink-0 px-3">
                  <span
                    className={
                      p.status === "VERIFIED" ? "text-amber-400" : "text-slate-500"
                    }
                  >
                    <Ribbon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {tierTitle}
                  </span>
                  {p.status === "VERIFIED" ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                  ) : (
                    <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/30">
                      Pending
                    </span>
                  )}
                </div>

                {/* Right: Value / Score formatted */}
                <div className="text-right shrink-0 pl-2">
                  <span className="text-sm sm:text-base font-extrabold font-mono text-white group-hover:text-amber-300 transition-colors block">
                    {formatScore(p.value, unitType, customUnit)}
                  </span>
                  {(p.customMeta as { delayOffsetMs?: number })?.delayOffsetMs !== undefined && (
                    <span className="text-[10px] font-mono text-cyan-400 block -mt-0.5">
                      +{(p.customMeta as { delayOffsetMs?: number }).delayOffsetMs}ms
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
