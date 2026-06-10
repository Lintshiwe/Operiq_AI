import { Link, useRouterState } from "@tanstack/react-router";
import {
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  PanelLeft,
  Plus,
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
  { to: "/email", label: "Email Studio", icon: Mail },
  { to: "/meetings", label: "Meetings", icon: CalendarCheck2 },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/research", label: "Research", icon: BookOpen },
];

/**
 * AppShell — ChatGPT-style dark sidebar for tool pages.
 * The assistant page has its own dedicated layout (AssistantThreadPage).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(true);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex h-dvh w-full bg-background text-foreground">
      {/* Sidebar */}
      {open && (
        <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 h-14">
            <BrandMark />
            <span className="font-semibold text-sm">Operiq</span>
            <span className="text-sm text-muted-foreground">AI</span>
          </div>

          {/* New chat button */}
          <div className="px-2 pb-2">
            <Link
              to="/assistant"
              className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
            >
              <Plus className="size-4" />
              New chat
            </Link>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {NAV.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as "/assistant"}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>
      )}

      {/* Sidebar toggle (mobile) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-md bg-sidebar text-sidebar-foreground border border-sidebar-border"
          aria-label="Open sidebar"
        >
          <PanelLeft className="size-4" />
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50">
            <div className="flex items-center justify-between px-3 h-14">
              <div className="flex items-center gap-2">
                <BrandMark />
                <span className="font-semibold text-sm">Operiq</span>
                <span className="text-sm text-muted-foreground">AI</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent"
              >
                <PanelLeft className="size-4" />
              </button>
            </div>
            <div className="px-2 pb-2">
              <Link
                to="/assistant"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
              >
                <Plus className="size-4" />
                New chat
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {NAV.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to as "/assistant"}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
                      active
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-lg bg-[#10a37f] text-white",
        className,
      )}
    >
      <span className="text-[13px] font-bold leading-none">O</span>
    </span>
  );
}
