import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  Image as ImageIcon,
  PenTool,
  FolderHeart,
  Settings,
  Sparkles,
  Crown,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

interface SidebarProps {
  activeItem?: string;
}

export function DashboardSidebar({ activeItem = "Image Generator" }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/70 backdrop-blur-xl md:flex">
      {/* Workspace Brand Logo: Nova AI */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Nova AI
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                Studio
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Creative Suite v2.0</span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Core Modules
        </div>

        <Link
          to="/"
          className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span>Dashboard</span>
        </Link>

        <button
          onClick={() => toast("Video Generator module active in Nova Studio", { icon: "🎬" })}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <Video className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span>Video Generator</span>
          <span className="ml-auto rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-500/20">
            HD
          </span>
        </button>

        {/* Active Highlight: Image Generator */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-xl bg-muted/80 px-3.5 py-2.5 text-sm font-semibold text-foreground border border-border shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
              <ImageIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span>Image Generator</span>
            <span className="ml-auto flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
          {/* Active left indicator */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-primary shadow-[0_0_8px_hsl(var(--primary))]" />
        </div>

        <button
          onClick={() => toast("Content Writer module ready", { icon: "✍️" })}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <PenTool className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span>Content Writer</span>
        </button>

        <button
          onClick={() => toast("Opening user asset cloud gallery", { icon: "📂" })}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <FolderHeart className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span>My Assets</span>
          <span className="ml-auto text-xs font-mono text-muted-foreground">248</span>
        </button>

        <div className="pt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          System
        </div>

        <button
          onClick={() => toast("Settings & API Keys modal", { icon: "⚙️" })}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Pro Plan Credit Badge */}
      <div className="px-4 py-3 mx-3 mb-4 rounded-2xl bg-muted/50 border border-border">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Crown className="h-3.5 w-3.5 text-amber-500" /> Nova Pro GPU
          </span>
          <span className="text-[11px] font-mono font-semibold text-primary">840/1000 Fast</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div className="h-full w-[84%] rounded-full bg-gradient-primary shadow-elegant" />
        </div>
      </div>

      {/* User Profile Card at Bottom */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="h-9 w-9 rounded-full object-cover border border-border ring-2 ring-primary/20"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">Alex Morgan</span>
            <span className="text-[11px] text-muted-foreground truncate">alex.m@nova-ai.io</span>
          </div>
          <Link to="/login" title="Logout" className="ml-auto p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
