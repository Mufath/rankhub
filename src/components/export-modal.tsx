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
    const rows = board.participants.map((p) => [
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

  const domain = typeof window !== "undefined" ? window.location.origin : "https://rankhub.vercel.app";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ekspor Data & Integrasi API</h3>
            <p className="text-xs text-slate-400">
              Download dataset atau hubungkan langsung ke bot eksternal via REST API
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={downloadJSON}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm transition-all cursor-pointer group"
          >
            <FileJson className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Download format JSON</span>
          </button>

          <button
            type="button"
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 font-semibold text-sm transition-all cursor-pointer group"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Download format CSV (Excel)</span>
          </button>
        </div>

        {/* API Endpoint Section */}
        <div className="space-y-4 border-t border-slate-800 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              REST API Endpoint (SubSecond Queue)
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">
              Admin Secret / Key (Opsional untuk membuka sensor NIM publik):
            </label>
            <input
              type="text"
              placeholder="Masukkan rankhub2026 untuk full unmasked NIM"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Endpoint Box */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-slate-300 truncate">
              GET {apiEndpointUrl}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(apiEndpointUrl, "endpoint")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 shrink-0"
            >
              {copiedType === "endpoint" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Salin URL</span>
            </button>
          </div>

          {/* Code Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Contoh Integrasi Cloudflare Worker:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(workerCodeSnippet, "worker")}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedType === "worker" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Salin Script Worker</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              <code>{workerCodeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
