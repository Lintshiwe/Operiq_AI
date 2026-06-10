import { Link, useRouterState } from "@tanstack/react-router";
import {
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  ShieldCheck,
  Menu,
  X,
  Sparkle,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  hint: string;
  icon: typeof Mail;
};

const NAV: NavItem[] = [
  { to: "/assistant", label: "Assistant", hint: "Conversational AI", icon: MessageSquareText },
  { to: "/email", label: "Email", hint: "Drafting studio", icon: Mail },
  { to: "/meetings", label: "Meetings", hint: "Notes intelligence", icon: CalendarCheck2 },
  { to: "/planner", label: "Planner", hint: "Daily & weekly", icon: ListChecks },
  { to: "/research", label: "Research", hint: "Summaries & insight", icon: BookOpen },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/85 backdrop-blur px-4 h-14">
        <Link to="/assistant" className="flex items-center gap-2">
          <Brand variant="light" />
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      <div className="lg:grid lg:grid-cols-[72px_1fr]">
        {/* Rail Sidebar */}
        <aside
          className={cn(
            "bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-dvh flex-col items-stretch",
            open ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="px-3 pt-5 pb-4 flex flex-col items-center">
            <Link to="/assistant" onClick={() => setOpen(false)} aria-label="FlowDesk AI home">
              <span className="relative inline-flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-soft">
                <span className="font-display text-lg font-semibold leading-none">F</span>
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-accent ring-2 ring-sidebar" />
              </span>
            </Link>
          </div>

          <nav className="flex-1 flex flex-col items-stretch gap-1 px-2 py-3">
            {NAV.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as "/assistant"}
                  onClick={() => setOpen(false)}
                  title={`${item.label} — ${item.hint}`}
                  className={cn(
                    "group relative mx-auto flex size-12 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-[18px]" strokeWidth={1.75} />
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-accent" />
                  )}
                  <span className="pointer-events-none absolute left-full ml-3 hidden lg:group-hover:flex items-center gap-1 whitespace-nowrap rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs text-sidebar-accent-foreground shadow-card border border-sidebar-border z-50">
                    <span className="font-medium">{item.label}</span>
                    <span className="opacity-60">· {item.hint}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-4 pt-2 flex flex-col items-center gap-2">
            <span
              title="Responsible AI — review before sending"
              className="flex size-9 items-center justify-center rounded-lg border border-sidebar-border text-sidebar-foreground/70"
            >
              <ShieldCheck className="size-4" />
            </span>
          </div>
        </aside>

        <main className="min-h-dvh">{children}</main>
      </div>
    </div>
  );
}

function Brand({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const fg = variant === "light" ? "text-foreground" : "text-sidebar-foreground";
  return (
    <span className={cn("flex items-center gap-2.5", fg)}>
      <span className="relative inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 lg:py-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-secondary">
              <Sparkle className="size-3 text-accent" /> {eyebrow}
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
      <ShieldCheck className="size-3.5 mt-0.5 text-primary shrink-0" />
      <p>
        AI-generated draft. Review for accuracy, tone, and potential bias before sending or acting on it.
      </p>
    </div>
  );
}
