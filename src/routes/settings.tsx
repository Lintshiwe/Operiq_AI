/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Moon, Sun, User, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Operiq AI" },
      { name: "description", content: "Operiq AI settings" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("operiq-theme");
    if (saved === "dark") {
      setIsDark(true);
    } else if (saved === "light") {
      setIsDark(false);
    } else {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("operiq-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("operiq-theme", "light");
    }
  }

  return (
    <div className="flex h-dvh w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-3 h-14">
          <img src="/logo-icon.png" alt="Operiq AI" className="size-7 rounded-lg" />
          <span className="font-semibold text-sm">Operiq</span>
          <span className="text-sm text-muted-foreground">AI</span>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <Link
            to="/assistant"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            Back to assistant
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Mobile header */}
        <header className="md:hidden h-14 flex items-center px-4 border-b border-border/60">
          <Link to="/assistant" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 lg:px-6 py-8 space-y-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage your preferences and account settings.</p>
            </div>

            {/* Appearance section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                  <Sun className="size-4" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">Dark mode</p>
                    <p className="text-xs text-muted-foreground">
                      Toggle between light and dark interface themes.
                    </p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    role="switch"
                    aria-checked={isDark}
                    className={
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                      (isDark ? "bg-accent" : "bg-muted-foreground/30")
                    }
                  >
                    <span
                      className={
                        "inline-flex size-4 items-center justify-center rounded-full bg-white transition-transform " +
                        (isDark ? "translate-x-6" : "translate-x-1")
                      }
                    >
                      {isDark ? (
                        <Moon className="size-3 text-accent" />
                      ) : (
                        <Sun className="size-3 text-muted-foreground" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Profile section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                  <User className="size-4" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Profile</h2>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Account details</p>
                  <p className="text-xs text-muted-foreground">
                    Profile settings will be available here soon.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
