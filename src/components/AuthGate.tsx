import { useConvexAuth } from "@convex-dev/auth/react";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-lg bg-[#10a37f] flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          <div className="size-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
