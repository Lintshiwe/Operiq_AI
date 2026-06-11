/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useSsrConvexAuth } from "@/lib/use-ssr-convex-auth";
import { useState, useEffect } from "react";
import { LogIn, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Operiq AI" },
      { name: "description", content: "Sign in to Operiq AI" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const { isAuthenticated } = useSsrConvexAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (redirect) {
        window.location.href = redirect;
      } else {
        navigate({ to: "/assistant", replace: true });
      }
    }
  }, [isAuthenticated, navigate, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn("password", { email, password, flow: "signIn" });
      if (redirect) {
        window.location.href = redirect;
      } else {
        navigate({ to: "/assistant", replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src="/logo-icon.png" alt="Operiq AI" className="size-10 rounded-xl" />
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your Operiq AI account</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#10a37f] text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                Sign in
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-[#10a37f] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}