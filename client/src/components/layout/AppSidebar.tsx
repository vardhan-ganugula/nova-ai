import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  Cpu,
  Workflow,
  FolderKanban,
  Bookmark,
  History,
  Settings,
  Share2,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetUserQuery, useLogoutMutation } from "@/store/authSlice";
import { Tooltip } from "@/components/ui/tooltip";
import toast from "react-hot-toast";

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: userData } = useGetUserQuery();
  const [handleLogout] = useLogoutMutation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (externalCollapsed !== undefined) return externalCollapsed;
    return localStorage.getItem("nova_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("nova_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const user = userData?.user;
  const credits = user?.credits ?? 100;
  const currentPath = location.pathname;

  const onLogout = async () => {
    try {
      await handleLogout({}).unwrap();
      toast.success("Logged out successfully");
    } catch {
      // ignore
    }
    navigate("/");
  };

  const primaryNav = [
    {
      label: "Home",
      path: "/dashboard",
      icon: LayoutDashboard,
      active: currentPath === "/dashboard",
    },
    {
      label: "Create",
      path: "/create",
      icon: Sparkles,
      badge: "STUDIO",
      highlight: true,
      active:
        currentPath === "/create" ||
        currentPath === "/image-gen" ||
        currentPath === "/generate",
    },
    {
      label: "Explore",
      path: "/explore",
      icon: Compass,
      active:
        currentPath === "/explore" ||
        currentPath === "/image-gallary" ||
        currentPath === "/image-gallery",
    },
    {
      label: "Models",
      path: "/models",
      icon: Cpu,
      active: currentPath === "/models",
    },
    {
      label: "Workflows",
      path: "/workflows",
      icon: Workflow,
      badge: "BETA",
      active: currentPath === "/workflows",
    },
    {
      label: "Library",
      path: "/library",
      icon: FolderKanban,
      active: currentPath === "/library",
    },
    {
      label: "Collections",
      path: "/collections",
      icon: Bookmark,
      active: currentPath === "/collections",
    },
    {
      label: "History",
      path: "/history",
      icon: History,
      active: currentPath === "/history",
    },
    {
      label: "Socials",
      path: "/social",
      icon: Share2,
      badge: "AUTO",
      active:
        currentPath === "/social" ||
        currentPath === "/socials" ||
        currentPath === "/connections" ||
        currentPath === "/social-accounts",
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden md:flex flex-col border-r border-white/[0.08] bg-[#0c0c0e] transition-all duration-300 select-none ${
        isCollapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.08]">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-8 w-8 min-w-8 shrink-0 rounded-lg flex items-center justify-center">
            <img src="/logo.webp" alt="Vimitron Logo" className="h-full w-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-bold text-sm text-white tracking-tight">Vimitron</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
                AI
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-7 w-7 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {!isCollapsed && (
          <div className="px-2.5 pt-1 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Workspace
          </div>
        )}

        {primaryNav.map((item) => {
          const Icon = item.icon;
          const content = (
            <Link
              to={item.path}
              className={`group flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                item.active
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                  : item.highlight
                  ? "text-zinc-200 hover:bg-white/[0.06] hover:text-white"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`h-4 w-4 transition-colors flex-shrink-0 ${
                  item.active
                    ? "text-orange-400"
                    : item.highlight
                    ? "text-orange-400/80 group-hover:text-orange-400"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] border border-white/10 text-zinc-300 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.label} content={item.label} side="right">
                {content}
              </Tooltip>
            );
          }

          return <React.Fragment key={item.label}>{content}</React.Fragment>;
        })}

        {/* Separator */}
        <div className="my-2 border-t border-white/[0.06]" />

        {/* Secondary: Settings */}
        {(() => {
          const isSettingsActive = currentPath === "/settings";
          const settingsBtn = (
            <Link
              to="/settings"
              className={`group flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                isSettingsActive
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Settings
                className={`h-4 w-4 transition-colors flex-shrink-0 ${
                  isSettingsActive
                    ? "text-orange-400"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip content="Settings" side="right">
                {settingsBtn}
              </Tooltip>
            );
          }
          return settingsBtn;
        })()}
      </div>

      {/* Token Usage Bar (Only when expanded) */}
      {!isCollapsed ? (
        <div className="mx-2 mb-2 p-3 rounded-lg border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
              <Zap className="h-3 w-3 text-orange-400 fill-orange-400" />
              Credits
            </span>
            <span className="font-mono text-[11px] font-bold text-orange-400">
              {credits}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(5, (credits / 1000) * 100))}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-zinc-500">
            <span>Fast Tier</span>
            <Link
              to="/settings"
              className="text-orange-400 hover:text-orange-300 font-mono text-[9px] hover:underline"
            >
              Get More
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-2 flex justify-center">
          <Tooltip content={`${credits} Credits Remaining`} side="right">
            <Link
              to="/settings"
              className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 hover:bg-orange-500/20 transition-colors"
            >
              <Zap className="h-3.5 w-3.5 fill-orange-400" />
            </Link>
          </Tooltip>
        </div>
      )}

      {/* User profile footer */}
      <div className="p-2 border-t border-white/[0.08] bg-[#09090b]">
        <div
          className={`flex items-center rounded-lg p-1.5 transition-colors hover:bg-white/[0.04] ${
            isCollapsed ? "justify-center" : "gap-2.5"
          }`}
        >
          <div className="relative flex-shrink-0">
            <img
              src={
                user?.profilePicture ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              }
              alt="Avatar"
              className="h-7 w-7 rounded-full object-cover border border-white/10"
            />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-[#0c0c0e]" />
          </div>

          {!isCollapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-zinc-200 truncate">
                  {user?.displayName || user?.username || "Creative Artist"}
                </span>
                <span className="font-mono text-[9px] text-zinc-500 truncate">
                  {user?.email || "creator@vimitron.ai"}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
