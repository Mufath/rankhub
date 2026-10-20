"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, PlusCircle, Share2, Check, RefreshCw } from "lucide-react";
import { ExportModal } from "@/components/export-modal";
import { SubmitBidModal } from "@/components/submit-bid-modal";
import { BoardWithParticipants } from "@/types";

interface BoardClientControlsProps {
  board: BoardWithParticipants;
  isLocked: boolean;
}

export function BoardClientControls({ board, isLocked }: BoardClientControlsProps) {
  const router = useRouter();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <>
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Muat ulang klasemen terkini"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`}
            />
          </button>

          {/* Export & API Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Ekspor & API</span>
          </button>

          {/* Share Link */}
          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Bagikan</span>
              </>
            )}
          </button>
        </div>

        {/* Submit Bid Trigger */}
        {!isLocked && (
          <button
            type="button"
            onClick={() => setIsSubmitOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Kirim Penawaran / Submit</span>
          </button>
        )}
      </div>

      <ExportModal
        board={board}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <SubmitBidModal
        board={board}
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
