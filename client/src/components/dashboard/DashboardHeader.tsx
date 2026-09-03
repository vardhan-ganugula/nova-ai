import React from "react";
import { Search, Bell, SlidersHorizontal, Command } from "lucide-react";
import toast from "react-hot-toast";

interface DashboardHeaderProps {
  title?: string;
  versionBadge?: string;
}

export function DashboardHeader({
  title = "Image Generator",
  versionBadge = "Nova Studio v6.0",
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          {title}
          <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
            {versionBadge}
          </span>
        </h1>
      </div>

      {/* Global Search Bar */}
      <div className="relative hidden w-80 max-w-md items-center sm:flex">
        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search prompts, styles, or creators..."
          className="h-9 w-full rounded-full border border-border bg-card pl-10 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        />
        <div className="absolute right-3 flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-muted">
          <Command className="h-2.5 w-2.5" /> K
        </div>
      </div>

      {/* Header Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => toast("No unread alerts", { icon: "🔔" })}
          className="relative rounded-full border border-border bg-card p-2 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground transition-all shadow-sm"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="h-5 w-[1px] bg-border" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast("Custom generation parameter suite", { icon: "⚡" })}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 transition-all shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            Parameters
          </button>

          <button
            onClick={() => toast.success("Connected to Nova GPU Cluster #4")}
            className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Online</span>
          </button>
        </div>
      </div>
    </header>
  );
}
