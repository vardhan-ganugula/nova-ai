import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  History,
  Search,
  Copy,
  Download,
  Wand2,
  Clock,
  Sparkles,
  ExternalLink,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useGetUserHistoryQuery } from "@/store/authSlice";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { data: historyData, isLoading } = useGetUserHistoryQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const sampleHistory = [
    {
      id: "hist-1",
      prompt: "Ethereal crystal celestial guardian in nebula clouds, ultra-detailed raytracing, cinematic lighting",
      r2Url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      model: "flux-1-pro",
      tokensDeducted: 10,
      aspectRatio: "16:9",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "hist-2",
      prompt: "Neo-Tokyo cyber samurai reflected on rain drenched asphalt with pink neon signs",
      r2Url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
      model: "photoreal-cine",
      tokensDeducted: 12,
      aspectRatio: "16:9",
      status: "completed",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "hist-3",
      prompt: "Porcelain android geisha with holographic origami butterflies, ambient gold glow",
      r2Url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
      model: "cyber-anime-v4",
      tokensDeducted: 10,
      aspectRatio: "1:1",
      status: "completed",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "hist-4",
      prompt: "Ancient overgrown solarpunk sky towers with vertical hydroponic gardens at dawn",
      r2Url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      model: "sdxl-turbo",
      tokensDeducted: 8,
      aspectRatio: "16:9",
      status: "completed",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const historyItems = historyData?.history?.length
    ? historyData.history
    : sampleHistory;

  const filteredItems = historyItems.filter((item: any) =>
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyPrompt = (prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleDownload = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = url;
    link.download = `nova-${Date.now()}.png`;
    link.target = "_blank";
    link.click();
    toast.success("Downloading master render...");
  };

  return (
    <AppShell title="Generation History" subtitleBadge="[ AUDIT & RE-RUN ]">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <History className="h-6 w-6 text-orange-400" />
              <span>Generation Timeline</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/5">
                {filteredItems.length} Records
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Audit all neural diffusion generation tasks, re-run prompts, and inspect spent tokens.
            </p>
          </div>

          <Link
            to="/create"
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          >
            <Sparkles className="h-4 w-4 fill-black" />
            <span>Open Studio</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search history prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#121215] border border-white/[0.08] rounded-lg text-xs font-medium text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        {/* Timeline List */}
        {isLoading ? (
          <div className="py-16 text-center text-zinc-500 font-mono text-xs">
            Loading telemetry logs...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-xl border border-white/5 p-8">
            <History className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-200">No generation history</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Start synthesizing in the Studio to record your prompts and renders.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item: any) => (
              <div
                key={item.id}
                onClick={() => navigate("/create")}
                className="group p-3 rounded-xl border border-white/[0.08] bg-[#121215] hover:border-orange-500/40 hover:bg-[#151519] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                    <img
                      src={item.r2Url || item.displayUrl}
                      alt={item.prompt}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-medium text-zinc-200 line-clamp-2 leading-relaxed">
                      "{item.prompt}"
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-500">
                      <span className="px-1.5 py-0.2 rounded bg-white/[0.05] text-zinc-300">
                        {item.model || "flux-1-pro"}
                      </span>
                      <span>•</span>
                      <span className="text-orange-400 font-semibold">
                        -{item.tokensDeducted || 10} Tokens
                      </span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => copyPrompt(item.prompt, e)}
                    title="Copy Prompt"
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDownload(item.r2Url || item.displayUrl, e)}
                    title="Download Master"
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>

                  <Link
                    to="/create"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition flex items-center gap-1 shadow-sm"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>Remix</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
