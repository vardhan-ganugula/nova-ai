import React, { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppTopBar } from "./AppTopBar";
import { Link, useLocation } from "react-router-dom";
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
  X,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitleBadge?: string;
  noPadding?: boolean; // For full-bleed 3-panel workspace on /create
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  subtitleBadge,
  noPadding = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("nova_sidebar_collapsed") === "true";
  });
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Keep in sync with localStorage changes from sidebar toggle
  useEffect(() => {
    const handleStorage = () => {
      setIsCollapsed(localStorage.getItem("nova_sidebar_collapsed") === "true");
    };
    window.addEventListener("storage", handleStorage);
    // Also poll gently or update when clicks happen on sidebar
    const interval = setInterval(handleStorage, 300);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const mobileNav = [
    { label: "Home", path: "/dashboard", icon: LayoutDashboard },
    { label: "Create Studio", path: "/create", icon: Sparkles, highlight: true },
    { label: "Explore Gallery", path: "/explore", icon: Compass },
    { label: "Models", path: "/models", icon: Cpu },
    { label: "Workflows", path: "/workflows", icon: Workflow },
    { label: "Library", path: "/library", icon: FolderKanban },
    { label: "Collections", path: "/collections", icon: Bookmark },
    { label: "History", path: "/history", icon: History },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans antialiased">
      {/* Desktop App Sidebar */}
      <AppSidebar />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-[#0c0c0e] border-r border-white/10 p-4 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/logo.webp" alt="Nova AI Logo" className="h-full w-full object-contain" />
                  </div>
                  <span className="font-bold text-sm text-white">Nova AI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {mobileNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                          : item.highlight
                          ? "text-orange-400 bg-orange-500/5 hover:bg-orange-500/10"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`min-w-0 flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? "md:pl-[68px]" : "md:pl-[240px]"
        }`}
      >
        <AppTopBar
          title={title}
          subtitleBadge={subtitleBadge}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className={`min-w-0 flex-1 ${noPadding ? "p-0 overflow-hidden" : "p-4 sm:p-6 lg:p-8"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
