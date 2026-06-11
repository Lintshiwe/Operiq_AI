/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  PanelLeft,
  Plus,
  Code2,
  SquarePen,
  LogOut,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
type NavItem = {
  to: string;
  label: string;
  icon: typeof Mail;
};

const CHAT_NAV: NavItem[] = [
  { to: "/assistant", label: "Assistant", icon: MessageSquareText },
];

const STUDIO_NAV: NavItem[] = [
  { to: "/code", label: "Code", icon: Code2 },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  function navLink(item: NavItem, onClick?: () => void) {
    const active = isActive(item.to);
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to as "/assistant"}
        onClick={onClick}
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
  }

  function UserProfile() {
    const user = useQuery(api.users.me);

    if (user === undefined) {
      return (
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      );
    }

    if (!user) return null;

    const name = user.name || user.email || "User";
    const initial = name.charAt(0).toUpperCase();

    return (
      <Link
        to="/settings"
        className="flex items-center gap-2.5 px-3 py-2.5 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-sidebar-foreground truncate">{name}</span>
      </Link>
    );
  }

  function LogoutButton() {
    const { signOut } = useAuthActions();
    const navigate = useNavigate();

    return (
      <button
        onClick={() => {
          signOut();
          navigate({ to: "/login" });
        }}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
      >
        <LogOut className="size-4" strokeWidth={1.75} />
        Sign out
      </button>
    );
  }

  return (
    <div className="flex h-dvh w-full bg-background text-foreground">
      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 h-14">
          <img src="/logo-full.png" alt="Operiq AI" className="h-8" />
        </div>

        {/* New chat button */}
        <div className="px-2 pb-2">
          <Link
            to="/assistant"
            className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
          >
            <SquarePen className="size-4" />
            New chat
          </Link>
        </div>

        {/* Nav items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
          {/* Chat section */}
          <p className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/40">
            Chat
          </p>
          {CHAT_NAV.map((item) => navLink(item))}
          {/* Studio section */}
          <p className="px-2.5 pt-4 pb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/40">
            Studio
          </p>
          {STUDIO_NAV.map((item) => navLink(item))}
        </div>

        <div className="flex-shrink-0">
          <UserProfile />
        </div>
        <div className="flex-shrink-0">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-md bg-sidebar text-sidebar-foreground border border-sidebar-border"
          aria-label="Open sidebar"
        >
          <PanelLeft className="size-4" />
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50">
            <div className="flex items-center justify-between px-3 h-14">
              <img src="/logo-full.png" alt="Operiq AI" className="h-7" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent"
              >
                <PanelLeft className="size-4" />
              </button>
            </div>
            <div className="px-2 pb-2">
              <Link
                to="/assistant"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
              >
                <Plus className="size-4" />
                New chat
              </Link>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-2">
              <p className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/40">
                Chat
              </p>
              {CHAT_NAV.map((item) => navLink(item, () => setMobileOpen(false)))}
              <p className="px-2.5 pt-4 pb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/40">
                Studio
              </p>
              {STUDIO_NAV.map((item) => navLink(item, () => setMobileOpen(false)))}
            </div>

            <div className="flex-shrink-0">
              <UserProfile />
            </div>
            <div className="flex-shrink-0">
              <LogoutButton />
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

export { Logo } from "@/components/Logo";