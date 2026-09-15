import React from "react";
import { Search, Bell, Zap } from "lucide-react";
import toast from "react-hot-toast";

interface DashboardHeaderProps {
  title?: string;
  subtitleBadge?: string;
  tokens?: number;
}

export function DashboardHeader({
  title = "Image Generator",
  subtitleBadge = "[ ENGINE FLUX & PHOENIX ]",
  tokens = 100,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.06] bg-[#0D0D0F]/90 px-6 backdrop-blur-md transition-all">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="font-serif-heading text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          {title}
          {subtitleBadge && (
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#FF7A00] px-2.5 py-0.5 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 font-semibold">
              <Zap className="h-3 w-3 text-[#FF7A00] fill-[#FF7A00]" />
              <span>{subtitleBadge}</span>
            </span>
          )}
        </h1>
      </div>

      {/* Global Search Bar */}
      <div className="relative hidden w-80 max-w-md items-center md:flex">
        <Search className="absolute left-3.5 h-3.5 w-3.5 text-white/30" />
        <input
          type="text"
          placeholder="Search models, styles, prompts..."
          className="h-9 w-full rounded-full border border-white/[0.08] bg-white/[0.05] pl-9 pr-12 font-sans text-xs text-white/80 placeholder:text-white/25 focus:border-[#FF7A00]/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
        />
        <div className="absolute right-2.5 flex items-center font-mono text-[9px] uppercase tracking-widest text-white/25 border border-white/[0.08] px-1.5 py-0.5 rounded-md bg-white/[0.04]">
          CTRL+K
        </div>
      </div>

      {/* Header Action Controls */}
      <div className="flex items-center gap-3">
        {/* Token Badge */}
        <button
          onClick={() => toast.success(`${tokens} Fast Generation Tokens active`)}
          className="cursor-pointer flex items-center gap-1.5 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-bold text-[#FF7A00] hover:bg-[#FF7A00]/20 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Zap className="h-3 w-3 fill-[#FF7A00] text-[#FF7A00]" />
          <span>[ {tokens} TOKENS ]</span>
        </button>

        <div className="h-4 w-[1px] bg-white/10" />

        {/* Notifications */}
        <button
          onClick={() => toast("No unread notifications")}
          className="cursor-pointer relative rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-white/40 hover:border-[#FF7A00]/30 hover:text-white/80 hover:bg-white/[0.08] hover:scale-105 transition-all duration-200 active:scale-95"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#FF7A00]" />
        </button>
      </div>
    </header>
  );
}
