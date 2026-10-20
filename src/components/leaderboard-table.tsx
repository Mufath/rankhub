"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Ban,
  Filter,
  Zap,
} from "lucide-react";
import { BoardUnitType, Participant, ParticipantStatus } from "@/types";
import { formatScore, maskIdentifier } from "@/lib/utils";

interface LeaderboardTableProps {
  participants: Participant[];
  unitType: BoardUnitType;
  customUnit?: string;
  defaultMasked?: boolean;
}

export function LeaderboardTable({
  participants,
  unitType,
  customUnit,
  defaultMasked = true,
}: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isMasked, setIsMasked] = useState(defaultMasked);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // Status filter
      if (statusFilter !== "ALL" && p.status !== statusFilter) {
        return false;
      }

      // Search filter (name or identifier)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesId = p.identifier.toLowerCase().includes(query);
        return matchesName || matchesId;
      }

      return true;
    });
  }, [participants, statusFilter, searchQuery]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRankBadge = (rank?: number) => {
    if (!rank) return null;
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/10">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-lg bg-slate-400/20 border border-slate-400/50 text-slate-200 font-bold flex items-center justify-center text-sm">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-lg bg-amber-700/20 border border-amber-700/50 text-amber-600 font-bold flex items-center justify-center text-sm">
          3
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono flex items-center justify-center text-xs">
        {rank}
      </span>
    );
  };

  const getStatusBadge = (status: ParticipantStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PAID / VERIFIED</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>PENDING</span>
          </span>
        );
      case "DISQUALIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-500/30">
            <Ban className="w-3.5 h-3.5 text-rose-400" />
            <span>DISQUALIFIED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 glass-card rounded-2xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama peserta atau NIM / ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter & Privacy Mask Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="inline-flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-medium text-slate-400">
            <Filter className="w-3.5 h-3.5 ml-2 mr-1 text-slate-500 hidden sm:inline" />
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "hover:text-slate-200"
              }`}
            >
              Semua ({participants.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("VERIFIED")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "VERIFIED"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                  : "hover:text-slate-200"
              }`}
            >
              Lunas / Verified
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === "PENDING"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                  : "hover:text-slate-200"
              }`}
            >
              Pending
            </button>
          </div>

          {/* Mask Toggle */}
          <button
            type="button"
            onClick={() => setIsMasked(!isMasked)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            title="Sembunyikan atau tampilkan digit identitas"
          >
            {isMasked ? (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lihat NIM</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Sensor NIM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table & Cards */}
      {filteredParticipants.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 text-slate-400">
          <p className="text-base font-medium">Tidak ada peserta yang cocok dengan filter.</p>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter status.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800/80 font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-3.5 text-center w-16">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Peserta / Identitas
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Nilai / Tawaran
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Metadata / Bot Offset
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredParticipants.map((p) => {
                  const delayOffset = (p.customMeta as { delayOffsetMs?: number })?.delayOffsetMs;
                  const telegram = (p.customMeta as { telegram?: string })?.telegram;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        p.rank === 1
                          ? "bg-amber-500/[0.04]"
                          : p.rank === 2
                          ? "bg-slate-400/[0.03]"
                          : p.rank === 3
                          ? "bg-amber-700/[0.03]"
                          : ""
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">{getRankBadge(p.rank)}</div>
                      </td>

                      {/* Participant & Identifier */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                            {p.name}
                            {p.rank === 1 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                LEADER
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-mono text-slate-400">
                              {maskIdentifier(p.identifier, isMasked)}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(p.identifier, p.id)}
                              className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5"
                              title="Salin identifier"
                            >
                              {copiedId === p.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Value / Bid */}
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-extrabold text-base text-cyan-300">
                          {formatScore(p.value, unitType, customUnit)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(p.status)}
                      </td>

                      {/* Custom Meta / Bot info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {delayOffset !== undefined && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                              <Zap className="w-3 h-3 text-cyan-400" />
                              Offset: {delayOffset}ms
                            </span>
                          )}
                          {telegram && (
                            <span className="text-xs text-slate-400 font-mono">
                              {telegram}
                            </span>
                          )}
                          {!delayOffset && !telegram && (
                            <span className="text-xs text-slate-600">-</span>
                          )}
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
  );
}
