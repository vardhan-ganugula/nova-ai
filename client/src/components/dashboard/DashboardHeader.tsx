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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md transition-all shadow-xs">
      {/* Page Title: Elegant Serif Font */}
      <div className="flex items-center gap-3">
        <h1 className="font-serif-heading text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          {title}
          {subtitleBadge && (
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 font-semibold">
              <Zap className="h-3 w-3 text-purple-600 fill-purple-600" />
              <span>{subtitleBadge}</span>
            </span>
          )}
        </h1>
      </div>

      {/* Global Search Bar */}
      <div className="relative hidden w-80 max-w-md items-center md:flex">
        <Search className="absolute left-3.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search models, styles, prompts..."
          className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-12 font-sans text-xs text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-xs"
        />
        <div className="absolute right-2.5 flex items-center font-mono text-[9px] uppercase tracking-widest text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md bg-white">
          CTRL+K
        </div>
      </div>

      {/* Header Action Controls */}
      <div className="flex items-center gap-3">
        {/* Token Badge */}
        <button
          onClick={() => toast.success(`${tokens} Fast Generation Tokens active`)}
          className="cursor-pointer flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-bold text-purple-700 shadow-xs hover:bg-purple-100 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Zap className="h-3 w-3 fill-purple-600 text-purple-600" />
          <span>[ {tokens} TOKENS ]</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200" />

        {/* User Notifications */}
        <button
          onClick={() => toast("No unread notifications")}
          className="cursor-pointer relative rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all duration-200 active:scale-95 shadow-xs"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
      </div>
    </header>
  );
}
