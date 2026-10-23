"use client";

import { useState } from "react";
import { Download, Code2, Copy, Check, FileSpreadsheet, FileJson, X } from "lucide-react";
import { BoardWithParticipants } from "@/types";

interface ExportModalProps {
  board: BoardWithParticipants;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ board, isOpen, onClose }: ExportModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(board, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${board.slug}-rankhub.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadCSV = () => {
    const headers = ["Rank", "Name", "Identifier", "Value", "Status", "UpdatedAt"];
    const rows = (board.participants || []).map((p) => [
      p.rank || "",
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.identifier}"`,
      p.value,
      p.status,
      `"${p.updatedAt}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${board.slug}-ranks.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const domain =
    typeof window !== "undefined" ? window.location.origin : "https://rankhub.vercel.app";
  const apiEndpointUrl = `${domain}/api/boards/${board.slug}/ranks?format=queue${
    apiKeyInput ? `&secret=${apiKeyInput}` : ""
  }`;

  const workerCodeSnippet = `// Cloudflare Worker / Bot Snippet for SubSecond Priority Queue
export default {
  async fetch(request, env) {
    // 1. Ambil daftar antrean prioritas dari RankHub
    const response = await fetch("${domain}/api/boards/${board.slug}/ranks?format=queue", {
      headers: {
        "x-api-key": env.RANKHUB_ADMIN_SECRET || "${apiKeyInput || "YOUR_ADMIN_SECRET"}",
      }
    });

    const data = await response.json();
    if (!data.success) {
      return new Response("Failed to fetch queue", { status: 500 });
    }

    // 2. Eksekusi urutan bot berdasarkan priorityIndex (hanya peserta VERIFIED/LUNAS)
    for (const item of data.queue) {
      console.log(\`[Priority #\${item.priorityIndex}] Eksekusi NIM: \${item.identifier} (Delay: \${item.delayOffsetMs}ms)\`);
      // Lakukan dispatch trigger bot / payload di sini...
    }

    return new Response(JSON.stringify({ status: "executed", count: data.count }), {
      headers: { "content-type": "application/json" }
    });
  }
};`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF6E9] border border-white/90 rounded-[36px] max-w-2xl w-full p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.18)] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
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
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              Ekspor Data & Integrasi API
            </h3>
            <p className="text-xs text-gray-500 font-semibold truncate max-w-[340px]">
              Download dataset atau sinkronkan langsung ke bot Cloudflare Worker
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={downloadJSON}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-amber-900/10 hover:border-amber-500 text-gray-800 font-bold text-xs transition-all shadow-xs cursor-pointer group active:scale-98"
          >
            <FileJson className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Download Format JSON</span>
          </button>

          <button
            type="button"
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-amber-900/10 hover:border-emerald-500 text-gray-800 font-bold text-xs transition-all shadow-xs cursor-pointer group active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Download Format CSV (Excel)</span>
          </button>
        </div>

        {/* API Endpoint Section */}
        <div className="space-y-3.5 border-t border-gray-200/80 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-600" />
              REST API Endpoint (SubSecond Bot Queue)
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600">
              Admin Secret / Key (Opsional untuk membuka unmasked NIM):
            </label>
            <input
              type="text"
              placeholder="Masukkan secret untuk unmasked NIM (default: rankhub2026)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-white/80 border border-amber-900/10 rounded-xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/40 transition-all"
            />
          </div>

          {/* Endpoint Box */}
          <div className="p-3 bg-white/90 border border-amber-900/10 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <span className="font-mono text-xs text-amber-900 truncate font-semibold">
              GET {apiEndpointUrl}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(apiEndpointUrl, "endpoint")}
              className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              {copiedType === "endpoint" ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Salin URL</span>
            </button>
          </div>

          {/* Code Snippet in macOS terminal style */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">
                Contoh Integrasi Cloudflare Worker:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(workerCodeSnippet, "worker")}
                className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === "worker" ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Salin Script Worker</span>
              </button>
            </div>
            <pre className="p-4 bg-[#1E2330] border border-slate-700/60 rounded-2xl font-mono text-[11px] text-slate-200 overflow-x-auto max-h-48 leading-relaxed shadow-inner">
              <code>{workerCodeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
