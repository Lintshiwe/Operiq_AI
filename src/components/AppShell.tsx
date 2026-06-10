import { Link, useRouterState } from "@tanstack/react-router";
import {
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Mail;
};

const NAV: NavItem[] = [
  { to: "/assistant", label: "Assistant", icon: MessageSquareText },
  { to: "/email", label: "Email", icon: Mail },
  { to: "/meetings", label: "Meetings", icon: CalendarCheck2 },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/research", label: "Research", icon: BookOpen },
];

/**
 * AppShell is used by all non-assistant pages.
 * The assistant page renders its own full ChatGPT-style sidebar with thread list.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/85 backdrop-blur px-4 lg:px-6 h-14">
        <div className="flex items-center gap-6">
          <Link to="/assistant" className="flex items-center gap-2">
            <BrandMark />
            <span className="font-semibold text-[15px]">FlowDesk</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as "/assistant"}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {open && (
        <div className="lg:hidden border-b border-border bg-background">
          <nav className="px-4 py-2 flex flex-col">
            {NAV.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as "/assistant"}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <main className="min-h-[calc(100dvh-3.5rem)]">{children}</main>
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background",
        className,
      )}
    >
      <span className="text-[12px] font-semibold leading-none">F</span>
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
    <div className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 lg:px-10 py-8 lg:py-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
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
        "flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck className="size-3.5 mt-0.5 text-foreground/70 shrink-0" />
      <p>
        AI-generated draft. Review for accuracy, tone, and potential bias before sending or acting on it.
      </p>
    </div>
  );
}
