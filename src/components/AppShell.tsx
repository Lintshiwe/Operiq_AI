import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/email", label: "Email Studio", icon: Mail },
  { to: "/meetings", label: "Meeting Intelligence", icon: CalendarCheck2 },
  { to: "/planner", label: "Task Planner", icon: ListChecks },
  { to: "/research", label: "Research Hub", icon: BookOpen },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquareText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4 h-14">
        <Link to="/" className="flex items-center gap-2">
          <Brand />
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-dvh lg:flex flex-col",
            open ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="px-6 pt-7 pb-6">
            <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <Brand variant="dark" />
            </Link>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-sidebar-foreground/55">
              Executive Workspace
            </p>
          </div>

          <div className="px-3 flex-1 overflow-y-auto">
            <nav className="space-y-0.5">
              {NAV.map((item) => {
                const active = isActive(item.to, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md border",
                        active
                          ? "border-sidebar-primary/50 bg-sidebar-primary/15 text-sidebar-primary"
                          : "border-sidebar-border text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-6 pb-6 pt-4 border-t border-sidebar-border">
            <div className="flex items-start gap-2.5 text-xs text-sidebar-foreground/65 leading-relaxed">
              <ShieldCheck className="size-4 mt-0.5 text-sidebar-primary shrink-0" />
              <p>
                AI-generated output may contain errors or bias. Please review before sharing or acting.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-h-dvh">{children}</main>
      </div>
    </div>
  );
}

function Brand({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const fg = variant === "dark" ? "text-sidebar-foreground" : "text-foreground";
  return (
    <span className={cn("flex items-center gap-2.5", fg)}>
      <span className="relative inline-flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <span className="font-display text-[15px] font-semibold">F</span>
        <span className="absolute -bottom-1 -right-1 size-2 rounded-full bg-accent" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-semibold tracking-tight">FlowDesk</span>
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-70">AI</span>
      </span>
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 lg:py-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent-foreground/80">
              <span className="text-accent">●</span> <span className="ml-1">{eyebrow}</span>
            </p>
          )}
          <h1 className="mt-3 font-display text-4xl lg:text-5xl font-semibold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base lg:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function AIDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck className="size-3.5 mt-0.5 text-secondary shrink-0" />
      <p>
        AI-generated draft. Review for accuracy, tone, and potential bias before sending or acting on it.
      </p>
    </div>
  );
}
