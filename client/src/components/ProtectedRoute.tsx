import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGetUserQuery } from "@/store/authSlice";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data, isLoading, isError } = useGetUserQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
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
