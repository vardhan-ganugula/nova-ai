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
import toast from "react-hot-toast";

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
      toast.success("Logged out successfully");
    } catch {
      // ignore
    }
    navigate("/");
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
      badgeColor: "text-[#FF7A00] border-[#FF7A00]/30 bg-[#FF7A00]/10",
      active: activeItem === "Explore Gallery" || currentPath === "/image-gallary" || currentPath === "/image-gallery",
    },
    {
      label: "Video Studio",
      path: "/dashboard#video",
      icon: Video,
      badge: "HD",
      badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0D0D0F] md:flex">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/[0.06]">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7A00] via-[#FF9A3C] to-[#FFB347] shadow-lg group-hover:scale-105 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(255,122,0,0.4)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-heading text-lg font-bold tracking-wide text-white flex items-center gap-2">
              Nova AI
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#FF7A00] border border-[#FF7A00]/30 px-1.5 rounded-full bg-[#FF7A00]/10">
                [ STUDIO ]
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        <div className="px-3 pb-3 font-mono text-[10px] uppercase tracking-widest text-white/30">
          [ 01 MODULES ]
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.active) {
            return (
              <div key={item.label} className="relative">
                <Link
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-3.5 py-2.5 text-xs font-semibold text-[#FF7A00] shadow-[0_0_12px_rgba(255,122,0,0.1)]"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF7A00] shadow-[0_0_10px_rgba(255,122,0,0.4)]">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span>{item.label}</span>
                  <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-[#FF7A00]" />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className="cursor-pointer group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90"
            >
              <Icon className="h-4 w-4 text-white/30 transition-colors group-hover:text-white/70" />
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

      {/* Token Counter Card */}
      <div className="mx-3 mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/60 font-semibold">
            <Zap className="h-3.5 w-3.5 text-[#FF7A00] fill-[#FF7A00]" /> FAST TOKENS
          </span>
          <span className="font-mono text-[10px] font-bold text-[#FF7A00]">[ {credits}/1000 ]</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] via-[#FF9A3C] to-[#FFB347] transition-all duration-500 shadow-[0_0_8px_rgba(255,122,0,0.6)]"
            style={{ width: `${Math.min(100, Math.max(5, (credits / 1000) * 100))}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase text-white/30 flex items-center justify-between">
          <span>STANDARD PLAN</span>
          <Link
            to="/settings"
            className="text-[#FF7A00] hover:underline cursor-pointer bg-transparent border-none p-0 text-[9px] font-bold"
          >
            VIEW USAGE
          </Link>
        </p>
      </div>

      {/* User Profile Card */}
      <div className="border-t border-white/[0.06] p-3.5 bg-white/[0.02]">
        <div className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/[0.05]">
          <div className="relative">
            <img
              src={
                user?.profilePicture ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              }
              alt="Avatar"
              className="h-8 w-8 rounded-full object-cover border border-white/10"
            />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0D0D0F]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white/80 truncate">
              {user?.displayName || user?.username || "Creative Artist"}
            </span>
            <span className="font-mono text-[9px] text-white/30 truncate uppercase">
              {user?.email || "user@nova.ai"}
            </span>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="ml-auto p-1.5 text-white/30 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
