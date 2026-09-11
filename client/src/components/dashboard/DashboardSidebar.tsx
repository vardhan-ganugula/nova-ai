import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  Image as ImageIcon,
  Mic,
  Compass,
  Settings,
  Sparkles,
  Zap,
  LogOut,
} from "lucide-react";
import { useGetUserQuery, useLogoutMutation } from "@/store/authSlice";

interface SidebarProps {
  activeItem?: string;
}

export function DashboardSidebar({ activeItem }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: userData } = useGetUserQuery();
  const [handleLogout] = useLogoutMutation();

  const user = userData?.user;
  const credits = user?.credits ?? 100;
  const currentPath = location.pathname;

  const onLogout = async () => {
    try {
      await handleLogout({}).unwrap();
    } catch {
      // ignore
    }
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      active: activeItem === "Dashboard" || currentPath === "/dashboard",
    },
    {
      label: "Image Generator",
      path: "/image-gen",
      icon: ImageIcon,
      active: activeItem === "Image Generator" || currentPath === "/image-gen" || currentPath === "/generate",
    },
    {
      label: "Explore Gallery",
      path: "/image-gallary",
      icon: Compass,
      badge: "NEW",
      badgeColor: "text-purple-700 border-purple-200 bg-purple-50",
      active: activeItem === "Explore Gallery" || currentPath === "/image-gallary" || currentPath === "/image-gallery",
    },
    {
      label: "Video Studio",
      path: "/dashboard#video",
      icon: Video,
      badge: "HD",
      badgeColor: "text-cyan-700 border-cyan-200 bg-cyan-50",
      active: activeItem === "Video Studio",
    },
    {
      label: "Audio Generator",
      path: "/dashboard#audio",
      icon: Mic,
      active: activeItem === "Audio Generator",
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
      active: activeItem === "Settings" || currentPath === "/settings",
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/90 bg-white backdrop-blur-xl md:flex shadow-xs">
      {/* Workspace Brand Logo: Nova AI */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-400 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-heading text-lg font-bold tracking-wide text-slate-900 flex items-center gap-2">
              Nova AI
              <span className="font-mono text-[9px] uppercase tracking-wider text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full bg-purple-50">
                [ STUDIO ]
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
          [ 01 MODULES ]
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.active) {
            return (
              <div key={item.label} className="relative">
                <Link
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl bg-purple-50 px-3.5 py-2.5 text-xs font-semibold text-purple-900 border border-purple-200/80 shadow-xs"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-600 shadow-xs">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span>{item.label}</span>
                  <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-purple-600" />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className="cursor-pointer group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-700" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`ml-auto font-mono text-[9px] uppercase tracking-wider border px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Token Counter & Tracker Card at Bottom */}
      <div className="mx-3 mb-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-700 font-semibold">
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> FAST TOKENS
          </span>
          <span className="font-mono text-[10px] font-bold text-purple-700">[ {credits}/1000 ]</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, (credits / 1000) * 100))}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase text-slate-500 flex items-center justify-between">
          <span>STANDARD PLAN</span>
          <Link
            to="/settings"
            className="text-purple-600 hover:underline cursor-pointer bg-transparent border-none p-0 text-[9px] font-bold"
          >
            VIEW USAGE
          </Link>
        </p>
      </div>

      {/* User Profile Card at Bottom */}
      <div className="border-t border-slate-100 p-3.5 bg-slate-50/40">
        <div className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-slate-100/70">
          <div className="relative">
            <img
              src={
                user?.profilePicture ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              }
              alt="Avatar"
              className="h-8 w-8 rounded-full object-cover border border-slate-200"
            />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-800 truncate">
              {user?.displayName || user?.username || "Creative Artist"}
            </span>
            <span className="font-mono text-[9px] text-slate-400 truncate uppercase">
              {user?.email || "user@nova.ai"}
            </span>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="ml-auto p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
