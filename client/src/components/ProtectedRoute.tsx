import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGetUserQuery } from "@/store/authSlice";
import { Sparkles } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data, isLoading, isError } = useGetUserQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#09090b] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
            <Sparkles className="w-4 h-4 text-orange-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
            Authenticating studio session...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useGetUserQuery();

  if (isLoading) {
    return null;
  }

  if (data?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
