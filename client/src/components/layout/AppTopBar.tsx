import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Zap,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGetUserQuery } from "@/store/authSlice";

interface AppTopBarProps {
  title?: string;
  subtitleBadge?: string;
  onOpenMobileMenu?: () => void;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  title,
  subtitleBadge,
  onOpenMobileMenu,
}) => {
  const location = useLocation();
  const { data: userData } = useGetUserQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const user = userData?.user;
  const credits = user?.credits ?? 100;

  // Determine breadcrumbs from route
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/dashboard") return { section: "Workspace", page: "Overview" };
    if (path === "/create" || path === "/image-gen" || path === "/generate")
      return { section: "Studio", page: "Create Image" };
    if (path === "/explore" || path.includes("gall"))
      return { section: "Community", page: "Explore Feed" };
    if (path === "/models") return { section: "Ecosystem", page: "Models Marketplace" };
    if (path === "/workflows") return { section: "Pipeline", page: "Node Workflows" };
    if (path === "/library") return { section: "Assets", page: "Personal Library" };
    if (path === "/collections") return { section: "Assets", page: "Collections" };
    if (path === "/history") return { section: "Telemetry", page: "Generation History" };
    if (path === "/settings") return { section: "Account", page: "Settings & Usage" };
    return { section: "Vimitron", page: title || "Workspace" };
  };

  const breadcrumb = getBreadcrumb();

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 w-full min-w-0 flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c0e]/95 px-3 sm:px-4 md:px-6 backdrop-blur-md">
      {/* Left: Mobile menu toggle + Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex min-w-0 items-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium hidden sm:inline">
            {breadcrumb.section}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600 hidden sm:inline" />
          <span className="truncate text-zinc-100 font-semibold tracking-tight text-sm sm:text-xs">
            {title || breadcrumb.page}
          </span>

          {subtitleBadge && (
            <span className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
              {subtitleBadge}
            </span>
          )}
        </div>
      </div>

      {/* Center: Command / Search Bar */}
      <div className="relative hidden lg:flex items-center w-72">
        <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search prompts, styles, models..."
          className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-9 pr-14 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-orange-500/40 focus:bg-white/[0.05] focus:outline-none transition-all"
        />
        <div className="absolute right-2 flex items-center">
          <span className="kbd-shortcut">Ctrl K</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="ml-2 flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Quick Create CTA (if not already on /create) */}
        {location.pathname !== "/create" && (
          <Link
            to="/create"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition-colors shadow-[0_0_12px_rgba(249,115,22,0.25)]"
          >
            <Sparkles className="h-3.5 w-3.5 fill-black" />
            <span>Create</span>
          </Link>
        )}

        {user ? (
          <>
            {/* Tokens Badge */}
            <Link
              to="/settings"
              title={`Total Credits: ${credits} (${user?.dailyCredits ?? 50} Daily Free [resets daily] + ${user?.purchasedCredits ?? 0} Purchased [1 Year])`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 font-mono text-[11px] font-bold text-orange-400 hover:bg-orange-500/15 transition-all"
            >

              <Zap className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
              <span>{credits}</span>
              <span className="hidden sm:inline text-orange-400/70 font-normal text-[10px]">
                Credits
              </span>
            </Link>

            {/* Notifications */}
            <button
              onClick={() => toast("All systems operational. No unread alerts.")}
              className="relative p-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              title="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
            </button>

            {/* Avatar link */}
            <Link
              to="/settings"
              className="h-8 w-8 rounded-lg overflow-hidden border border-white/10 hover:border-orange-500/50 transition-colors flex items-center justify-center bg-white/[0.04]"
              title="Account Settings"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="User"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-zinc-400" />
              )}
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-black text-xs font-semibold shadow-xs transition-colors"
            >
              Join Vimitron
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
