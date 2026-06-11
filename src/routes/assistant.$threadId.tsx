/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSsrConvexAuth } from "@/lib/use-ssr-convex-auth";
import { useAuthActions } from "@convex-dev/auth/react";
import { usePromptLimit } from "@/hooks/use-prompt-limit";
import { GenericId as Id } from "convex/values";
import {
  Plus,
  ArrowUp,
  Trash2,
  Loader2,
  PanelLeft,
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  Code2,
  LogIn,
  Sparkles,
  Settings,
  Paperclip,
  X,
  Cpu,
  ExternalLink,
  Mic,
  Headphones,
  Bot,
  Upload,
  Volume2,
  Link as LinkIcon,
  Share2,
  Download,
  FileDown,
  Star,
  Search,
  Keyboard,
  User,
  BadgeCheck,
  AlertTriangle,
  HelpCircle,
  LogOut,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { MarkdownView } from "@/components/MarkdownView";
import { Logo } from "@/components/Logo";
import { InviteDialog } from "@/components/InviteDialog";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { NotificationBell } from "@/components/NotificationBell";
import { cn } from "@/lib/utils";
import { deriveTitle, type Thread, loadThreads, saveThreads, createBlankThread } from "@/lib/threads";
import { MODELS, MODEL_STORAGE_KEY, MODEL_MAP } from "@/lib/models";
import { timeAgo } from "@/lib/time";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Route                                                             */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "Operiq AI" },
      { name: "description", content: "AI-powered workplace productivity assistant." },
    ],
  }),
  component: AssistantThreadPage,
});

const MODULES = [
  { to: "/code", label: "Code", icon: Code2 },
  { to: "/email", label: "Email Studio", icon: Mail },
  { to: "/meetings", label: "Meeting Intelligence", icon: CalendarCheck2 },
  { to: "/planner", label: "Task Planner", icon: ListChecks },
  { to: "/research", label: "Research Hub", icon: BookOpen },
];



/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */

const PINNED_KEY = "operiq-pinned-threads";

function loadPinned(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePinned(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PINNED_KEY, JSON.stringify(ids));
}

function AssistantThreadPage() {
  const { threadId } = useParams({ from: "/assistant/$threadId" });
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shareThreadId, setShareThreadId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>(loadPinned);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useSsrConvexAuth();
  const promptLimit = usePromptLimit();

  /* ---- authenticated: Convex threads ---- */
  const threads = useQuery(api.threads.list);
  const create = useMutation(api.threads.create);
  const update = useMutation(api.threads.update);
  const remove = useMutation(api.threads.remove);

  const hasCreatedRef = useRef(false);

  const isGuest = !authLoading && !isAuthenticated;

  /* ---- resolve current thread ---- */
  const currentThread = useMemo<Thread | null>(() => {
    if (authLoading) return null;

    if (isGuest) {
      const local = loadThreads();
      return local.find((t) => t.id === threadId) ?? null;
    }

    if (!threads) return null;
    const found = threads.find((t) => String(t._id) === threadId);
    return found
      ? {
          id: String(found._id),
          title: found.title,
          updatedAt: new Date(found.updatedAt).getTime(),
          messages: found.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            parts: [{ type: "text" as const, text: m.content }],
          })) as UIMessage[],
        }
      : null;
  }, [authLoading, isGuest, threadId, threads]);

  /* ---- auto-create / redirect if thread missing (authenticated) ---- */
  useEffect(() => {
    if (authLoading || isGuest || threads === undefined || hasCreatedRef.current) return;

    const current = threads.find((t) => String(t._id) === threadId);
    if (current) {
      hasCreatedRef.current = false;
      return;
    }

    if (threads.length === 0) {
      hasCreatedRef.current = true;
      create({ title: "New conversation", messages: [] })
        .then((id) => {
          navigate({ to: "/assistant/$threadId", params: { threadId: id as string } });
        })
        .catch((e) => {
          hasCreatedRef.current = false;
          console.error(e);
        });
    } else {
      navigate({ to: "/assistant/$threadId", params: { threadId: String(threads[0]._id) } });
    }
  }, [threads, threadId, authLoading, isGuest, create, navigate]);

  /* ---- auto-create local thread for guests if missing ---- */
  useEffect(() => {
    if (!isGuest || currentThread) return;
    const blank = createBlankThread();
    saveThreads([blank]);
    navigate({ to: "/assistant/$threadId", params: { threadId: blank.id }, replace: true });
  }, [isGuest, currentThread, navigate]);

  /* ---- handles ---- */
  const handleCreate = async () => {
    if (isGuest) {
      const blank = createBlankThread();
      const existing = loadThreads();
      saveThreads([blank, ...existing]);
      navigate({ to: "/assistant/$threadId", params: { threadId: blank.id } });
      return;
    }
    try {
      const id = await create({ title: "New conversation", messages: [] });
      hasCreatedRef.current = true;
      navigate({ to: "/assistant/$threadId", params: { threadId: id } });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (isGuest) {
      const local = loadThreads().filter((t) => t.id !== id);
      saveThreads(local);
      if (local.length > 0) {
        navigate({ to: "/assistant/$threadId", params: { threadId: local[0].id } });
      } else {
        const blank = createBlankThread();
        saveThreads([blank]);
        navigate({ to: "/assistant/$threadId", params: { threadId: blank.id } });
      }
      return;
    }
    try {
      await remove({ threadId: id as Id<"threads"> });
      if (id === threadId) {
        navigate({ to: "/assistant" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMessagesUpdate = (messages: UIMessage[]) => {
    if (isGuest) {
      const local = loadThreads();
      const title = deriveTitle(messages);
      saveThreads(local.map((t) => (t.id === threadId ? { ...t, messages, title, updatedAt: Date.now() } : t)));
      return;
    }
    const title = deriveTitle(messages);
    update({
      threadId: threadId as Id<"threads">,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
      })),
      title,
    }).catch((e) => console.error(e));
  };

  function togglePin(id: string) {
    const next = pinnedIds.includes(id)
      ? pinnedIds.filter((pid) => pid !== id)
      : [id, ...pinnedIds];
    setPinnedIds(next);
    savePinned(next);
  }

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && (e.key === "/" || e.key === "k")) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
      }
      if (isCmdOrCtrl && e.key === "n" && !e.shiftKey) {
        e.preventDefault();
        handleCreate();
      }
      if (isCmdOrCtrl && e.key === "n" && e.shiftKey) {
        e.preventDefault();
        handleCreate();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ---- loading ---- */
  if (authLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const guestThreads = isGuest ? loadThreads() : [];

  return (
    <div className="flex h-dvh w-full bg-background text-foreground">
      {/* Mobile hamburger toggle when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-md bg-sidebar text-sidebar-foreground border border-sidebar-border"
          aria-label="Open sidebar"
        >
          <PanelLeft className="size-4" />
        </button>
      )}

      {/* Desktop sidebar — inline */}
      {sidebarOpen && (
        <ThreadSidebar
          className="hidden md:flex"
          threads={isGuest ? guestThreads : (threads?.map(mapConvexThread) ?? [])}
          activeId={threadId}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onClose={() => setSidebarOpen(false)}
          isGuest={isGuest}
          onShare={setShareThreadId}
          pinnedIds={pinnedIds}
          onTogglePin={togglePin}
        />
      )}

      {/* Mobile sidebar — overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <ThreadSidebar
            className="absolute left-0 top-0 bottom-0 w-[260px]"
            threads={isGuest ? guestThreads : (threads?.map(mapConvexThread) ?? [])}
            activeId={threadId}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onClose={() => setSidebarOpen(false)}
            isGuest={isGuest}
            onShare={setShareThreadId}
            pinnedIds={pinnedIds}
            onTogglePin={togglePin}
          />
        </div>
      )}

      <ChatPane
        key={threadId}
        thread={
          currentThread ?? {
            id: threadId,
            title: "New conversation",
            updatedAt: Date.now(),
            messages: [],
          }
        }
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onNewChat={handleCreate}
        onMessagesUpdate={handleMessagesUpdate}
        promptLimit={promptLimit}
        isGuest={isGuest}
        shortcutsOpen={shortcutsOpen}
        onShortcutsOpenChange={setShortcutsOpen}
      />

      {shareThreadId && (
        <InviteDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setShareThreadId(null);
          }}
          threadId={shareThreadId}
        />
      )}

      <KeyboardShortcuts open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}

function mapConvexThread(t: {
  _id: string;
  title: string;
  updatedAt: string;
  messages: Array<{ id: string; role: string; content: string }>;
}): Thread {
  return {
    id: t._id,
    title: t.title,
    updatedAt: new Date(t.updatedAt).getTime(),
    messages: t.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      parts: [{ type: "text" as const, text: m.content }],
    })) as UIMessage[],
  };
}

/* ------------ Sidebar ------------ */

function ThreadSidebar({
  threads,
  activeId,
  onCreate,
  onDelete,
  onClose,
  isGuest,
  className,
  onShare,
  pinnedIds,
  onTogglePin,
}: {
  threads: Thread[];
  activeId: string;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  isGuest?: boolean;
  className?: string;
  onShare?: (id: string) => void;
  pinnedIds?: string[];
  onTogglePin?: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const pinnedThreads = useMemo(() => {
    if (!pinnedIds || pinnedIds.length === 0) return [];
    return pinnedIds
      .map((id) => threads.find((t) => t.id === id))
      .filter((t): t is Thread => !!t);
  }, [threads, pinnedIds]);

  const filteredGroups = useMemo(() => {
    if (!debouncedSearch.trim()) return groupThreads(threads);
    const q = debouncedSearch.toLowerCase();
    const filtered = threads.filter((t) => t.title.toLowerCase().includes(q));
    return filtered.length > 0 ? [{ label: "Results", threads: filtered }] : [];
  }, [threads, debouncedSearch]);

  return (
    <aside className={cn("w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border", className)}>
      {/* Logo area */}
      <div className="flex items-center justify-between gap-2 px-3 h-14">
        <div className="flex items-center gap-2">
          <img src="/logo-full.png" alt="Operiq AI" className="h-8" />
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={onClose}
            aria-label="Hide sidebar"
            className="p-1.5 rounded-md text-muted-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <PanelLeft className="size-4" />
          </button>
        </div>
      </div>

      {/* New chat */}
      <div className="px-2 pb-2">
        <button
          onClick={onCreate}
          className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
        >
          <Plus className="size-4" />
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="px-2 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2 py-1.5 pl-8 text-xs text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {threads.length === 0 && (
          <p className="px-3 py-6 text-xs text-muted-foreground">No conversations yet.</p>
        )}

        {debouncedSearch.trim() && filteredGroups.length === 0 && (
          <p className="px-3 py-6 text-xs text-muted-foreground">No threads found.</p>
        )}

        {/* Pinned section */}
        {pinnedThreads.length > 0 && !debouncedSearch.trim() && (
          <div>
            <p className="px-2 pb-1 text-[11px] font-medium text-muted-foreground">Pinned</p>
            <ul className="space-y-0.5">
              {pinnedThreads.map((t) => {
                const active = t.id === activeId;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "group relative rounded-md transition-colors",
                      active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/70",
                    )}
                  >
                    <Link
                      to="/assistant/$threadId"
                      params={{ threadId: t.id }}
                      className="block truncate pl-2.5 pr-20 py-2 text-sm text-sidebar-foreground"
                    >
                      {t.title}
                    </Link>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      <button
                        onClick={() => onTogglePin?.(t.id)}
                        aria-label={`Unpin ${t.title}`}
                        className="p-1 rounded-md text-accent hover:bg-background"
                      >
                        <Star className="size-3.5 fill-accent" />
                      </button>
                      <button
                        onClick={() => onShare?.(t.id)}
                        aria-label={`Share ${t.title}`}
                        className="p-1 rounded-md text-muted-foreground hover:bg-background hover:text-accent"
                      >
                        <Share2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
                        aria-label={`Delete ${t.title}`}
                        className="p-1 rounded-md text-muted-foreground hover:bg-background hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="my-2 border-b border-sidebar-border" />
          </div>
        )}

        {filteredGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1 text-[11px] font-medium text-muted-foreground">{group.label}</p>
            <ul className="space-y-0.5">
              {group.threads.map((t) => {
                const active = t.id === activeId;
                const isPinned = pinnedIds?.includes(t.id);
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "group relative rounded-md transition-colors",
                      active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/70",
                    )}
                  >
                    <Link
                      to="/assistant/$threadId"
                      params={{ threadId: t.id }}
                      className="block truncate pl-2.5 pr-20 py-2 text-sm text-sidebar-foreground"
                    >
                      {t.title}
                    </Link>
                    <div
                      className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-opacity",
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <button
                        onClick={() => onTogglePin?.(t.id)}
                        aria-label={isPinned ? `Unpin ${t.title}` : `Pin ${t.title}`}
                        className={cn(
                          "p-1 rounded-md hover:bg-background",
                          isPinned ? "text-accent" : "text-muted-foreground hover:text-accent"
                        )}
                      >
                        <Star className={cn("size-3.5", isPinned && "fill-accent")} />
                      </button>
                      <button
                        onClick={() => onShare?.(t.id)}
                        aria-label={`Share ${t.title}`}
                        className="p-1 rounded-md text-muted-foreground hover:bg-background hover:text-accent"
                      >
                        <Share2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
                        aria-label={`Delete ${t.title}`}
                        className="p-1 rounded-md text-muted-foreground hover:bg-background hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Guest upgrade CTA */}
      {isGuest && (
        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
          >
            <Sparkles className="size-4" />
            Sign in – unlock full access
          </Link>
        </div>
      )}

      {/* Workspace links at bottom */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <p className="px-2 pt-1 pb-1.5 text-[11px] font-medium text-muted-foreground">Workspaces</p>
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.to}
              to={m.to as "/email"}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {m.label}
            </Link>
          );
        })}
        <Link
          to="/settings"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Settings className="size-4" strokeWidth={1.75} />
          Settings
        </Link>
      </div>

      {/* Profile + Logout */}
      <ThreadSidebarUser />
    </aside>
  );
}

/* ------------ Sidebar User Profile ------------ */

function ThreadSidebarUser() {
  const user = useQuery(api.users.me);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  if (user === undefined) {
    return (
      <div className="border-t border-sidebar-border px-3 py-3">
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
    <div className="border-t border-sidebar-border">
      <Link
        to="/settings"
        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-sidebar-accent transition-colors"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-sidebar-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </Link>
      <button
        onClick={() => { signOut(); navigate({ to: "/login" }); }}
        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
      >
        <LogOut className="size-4" strokeWidth={1.75} />
        Sign out
      </button>
    </div>
  );
}

function groupThreads(threads: Thread[]) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const buckets: Record<string, Thread[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    "Previous 30 days": [],
    Older: [],
  };
  for (const t of threads) {
    const updatedAt =
      typeof t.updatedAt === "string" ? new Date(t.updatedAt).getTime() : t.updatedAt;
    const age = now - updatedAt;
    if (age < day) buckets.Today.push(t);
    else if (age < 2 * day) buckets.Yesterday.push(t);
    else if (age < 7 * day) buckets["Previous 7 days"].push(t);
    else if (age < 30 * day) buckets["Previous 30 days"].push(t);
    else buckets.Older.push(t);
  }
  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([label, arr]) => ({ label, threads: arr }));
}

/* ------------ Chat pane ------------ */

const QUICK_PROMPTS = [
  "Draft a polite follow-up to a client who hasn't replied in a week",
  "Summarize my meeting notes into decisions and action items",
  "Plan a focused workday with three deep-work blocks",
  "What sharp questions should I ask in a QBR?",
];

const PERSONALITIES = [
  { id: "default", label: "Default Assistant", prompt: "You are a helpful assistant." },
  { id: "teacher", label: "Teacher", prompt: "You are a patient teacher. Explain concepts clearly and simply. Use examples where helpful." },
  { id: "coach", label: "Business Coach", prompt: "You are a seasoned business coach. Give strategic, actionable advice. Be concise and results-oriented." },
  { id: "coder", label: "Code Reviewer", prompt: "You are an expert code reviewer. Analyze code for bugs, performance, and best practices. Be thorough but constructive." },
  { id: "writer", label: "Creative Writer", prompt: "You are a creative writer. Help with storytelling, copy, and creative expression. Be vivid and imaginative." },
  { id: "analyst", label: "Analyst", prompt: "You are a data analyst. Break down problems methodically. Use structured reasoning and highlight assumptions." },
];

function calculateConfidence(text: string): { level: "high" | "moderate" | "low"; label: string } {
  const uncertaintyWords = ["might", "may", "possibly", "uncertain", "probably", "likely", "could", "unsure", "guess"];
  const hasUncertainty = uncertaintyWords.some((w) => text.toLowerCase().includes(w));
  const length = text.length;
  if (length < 80 || hasUncertainty) {
    return { level: "low", label: "Review suggested" };
  }
  if (length < 200 || hasUncertainty) {
    return { level: "moderate", label: "Moderate confidence" };
  }
  return { level: "high", label: "High confidence" };
}

function ConfidenceBadge({ text }: { text: string }) {
  const { level, label } = calculateConfidence(text);
  const icons = {
    high: <BadgeCheck className="size-3" />,
    moderate: <HelpCircle className="size-3" />,
    low: <AlertTriangle className="size-3" />,
  };
  const colors = {
    high: "bg-green-100 text-green-800 border-green-200",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium", colors[level])}>
      {icons[level]}
      {label}
    </span>
  );
}

function ChatPane({
  thread,
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  onMessagesUpdate,
  promptLimit,
  isGuest,
  shortcutsOpen,
  onShortcutsOpenChange,
}: {
  thread: Thread;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onMessagesUpdate: (messages: UIMessage[]) => void;
  promptLimit: ReturnType<typeof usePromptLimit>;
  isGuest: boolean;
  shortcutsOpen: boolean;
  onShortcutsOpenChange: (v: boolean) => void;
}) {
  /* ---- Model selector state ---- */
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window === "undefined") return MODELS[4].id;
    return window.localStorage.getItem(MODEL_STORAGE_KEY) || MODELS[4].id;
  });
  const modelRef = useRef(selectedModel);

  useEffect(() => {
    modelRef.current = selectedModel;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    }
  }, [selectedModel]);

  /* ---- Agent mode state ---- */
  const [agentMode, setAgentMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("operiq-agent-mode") === "true";
  });
  const agentModeRef = useRef(agentMode);

  useEffect(() => {
    agentModeRef.current = agentMode;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("operiq-agent-mode", String(agentMode));
    }
  }, [agentMode]);

  /* ---- Transport with model + agent headers ---- */
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => ({
          "x-operiq-model": MODEL_MAP[modelRef.current] || modelRef.current,
          "x-operiq-agent-mode": agentModeRef.current ? "on" : "off",
        }),
      }),
    []
  );

  const [input, setInput] = useState("");
  const [files, setFiles] = useState<{ name: string; size: number; content: string }[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const voiceModeRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [loadingSpeechId, setLoadingSpeechId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPersonality, setSelectedPersonality] = useState(PERSONALITIES[0]);
  const personalityRef = useRef(selectedPersonality);

  useEffect(() => {
    personalityRef.current = selectedPersonality;
  }, [selectedPersonality]);

  /* ---- Auto-save draft ---- */
  const draftKey = `operiq-draft-${thread.id}`;
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved && !input) {
      setInput(saved);
    }
  }, [thread.id, draftKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (input.trim()) {
        localStorage.setItem(draftKey, input);
      } else {
        localStorage.removeItem(draftKey);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [input, draftKey]);

  const { messages, sendMessage, status, error } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (e) => console.error(e),
  });

  useEffect(() => {
    if (status === "submitted" || status === "streaming") return;
    onMessagesUpdate(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [thread.id]);

  // auto-grow textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  const isLoading = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0 && !isLoading;

  /* ---- File handling ---- */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles = Array.from(selected);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setFiles((prev) => [...prev, { name: file.name, size: file.size, content: result }]);
      };
      reader.readAsText(file);
    });

    // Reset input so the same file can be selected again
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function buildMessageWithFiles(text: string): string {
    if (files.length === 0) return text;

    const parts: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"];
      const textExts = [
        "txt", "md", "csv", "json", "xml", "yaml", "yml", "js", "ts", "jsx", "tsx",
        "html", "css", "scss", "py", "java", "c", "cpp", "h", "go", "rs", "rb", "php",
        "sh", "bash", "sql", "log", "ini", "conf", "env", "toml", "lock", "dockerfile",
      ];

      if (imageExts.includes(ext)) {
        parts.push(`[Image attached: ${file.name} (${formatFileSize(file.size)})]`);
      } else if (textExts.includes(ext)) {
        parts.push(`[File: ${file.name}]\n${file.content}`);
      } else {
        parts.push(`[File attached: ${file.name} (${formatFileSize(file.size)})]`);
      }
    }
    parts.push(text);
    return parts.join("\n\n");
  }

  async function submit(text: string) {
    const value = text.trim();
    if (!value || isLoading) return;

    /* Guest prompt limit check */
    if (isGuest && promptLimit.exhausted) return;

    /* Track guest prompt usage */
    if (isGuest) {
      promptLimit.increment();
    }

    /* Clear draft */
    localStorage.removeItem(draftKey);

    const personality = personalityRef.current;
    const messageWithFiles = buildMessageWithFiles(value);
    const finalText = personality.id !== "default"
      ? `[Persona: ${personality.label}]\n${personality.prompt}\n\n${messageWithFiles}`
      : messageWithFiles;

    setInput("");
    setFiles([]);
    await sendMessage({ text: finalText });
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function exportAsMarkdown() {
    const lines = [`# ${thread.title}`, ""];
    for (const m of messages) {
      const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
      lines.push(`## ${m.role === "user" ? "You" : "Operiq"}`, "", text, "");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${thread.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as Markdown");
  }

  function exportAsPDF() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export as PDF");
      return;
    }
    const lines = [`<h1>${thread.title}</h1>`];
    for (const m of messages) {
      const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("").replace(/\n/g, "<br/>");
      lines.push(`<h2>${m.role === "user" ? "You" : "Operiq"}</h2><p>${text}</p>`);
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${thread.title}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #111; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; color: #333; }
            p { line-height: 1.6; }
          </style>
        </head>
        <body>${lines.join("")}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success("Exported as PDF");
  }

  async function speakMessage(messageId: string, text: string) {
    if (speakingMessageId === messageId) {
      audioRef.current?.pause();
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
      setSpeakingMessageId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setSpeakingMessageId(null);
    setLoadingSpeechId(messageId);
    try {
      const res = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS request failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeakingMessageId(null);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      setLoadingSpeechId(null);
      setSpeakingMessageId(messageId);
      await audio.play();
    } catch {
      setLoadingSpeechId(null);
      toast.error("Failed to read aloud. Please try again.");
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;

        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const res = await fetch("/api/elevenlabs-stt", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("STT request failed");
          const data = await res.json();
          if (data.text) {
            setInput((prev) => (prev ? prev + " " + data.text : data.text));
          }
        } catch {
          toast.error("Failed to transcribe audio. Please try again.");
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Microphone access denied. Please allow microphone permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  async function handleSendVoice(userText: string) {
    if (!userText.trim()) return;
    await sendMessage({ text: userText });
  }

  async function startVoiceLoop() {
    voiceModeRef.current = true;
    while (voiceModeRef.current) {
      try {
        setVoiceState('listening');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.start();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        recorder.stop();
        stream.getTracks().forEach(t => t.stop());
        await new Promise((resolve) => { recorder.onstop = () => resolve(undefined); });
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        setVoiceState('thinking');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        const sttRes = await fetch('/api/elevenlabs-stt', { method: 'POST', body: formData });
        const { text } = await sttRes.json();
        if (!text || !text.trim()) continue;
        
        setInput(text);
        await handleSendVoice(text);
        
        setVoiceState('speaking');
        await new Promise(resolve => setTimeout(resolve, 3000));
        const assistantMessages = scrollRef.current?.querySelectorAll('[data-role="assistant"]');
        const lastMsg = assistantMessages?.[assistantMessages.length - 1]?.textContent;
        if (lastMsg) {
          const ttsRes = await fetch('/api/elevenlabs-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: lastMsg.substring(0, 500) }),
          });
          const audioBlob2 = await ttsRes.blob();
          const audio = new Audio(URL.createObjectURL(audioBlob2));
          await audio.play();
        }
      } catch (e) {
        console.error('Voice loop error:', e);
        setVoiceState('idle');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  return (
    <section className="flex-1 flex flex-col h-dvh bg-background min-w-0">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-3 lg:px-4 border-b border-border/60">
        <div className="flex items-center gap-1">
          {!sidebarOpen && (
            <>
              <button
                onClick={onToggleSidebar}
                aria-label="Show sidebar"
                className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <PanelLeft className="size-4" />
              </button>
              <button
                onClick={onNewChat}
                aria-label="New chat"
                className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted cursor-default">
            <img src="/logo-full.png" alt="Operiq AI" className="h-7" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Export conversation"
              >
                <Download className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem onClick={exportAsMarkdown}>
                <FileDown className="size-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsPDF}>
                <FileDown className="size-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => setInviteOpen(true)}
            className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Share conversation"
          >
            <Share2 className="size-4" />
          </button>
          <button
            onClick={() => onShortcutsOpenChange(true)}
            className="hidden md:flex p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="size-4" />
          </button>
          <button
            onClick={onNewChat}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="New chat"
          >
            <MessageSquareText className="size-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState onPick={(s) => submit(s)} promptLimit={promptLimit} isGuest={isGuest} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 lg:px-6 py-6 space-y-6">
            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  {isUser ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="max-w-[92%] sm:max-w-[80%] rounded-2xl bg-card text-foreground px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap border border-border">
                        {text}
                      </div>
                      <span className="text-[11px] text-muted-foreground/60 px-1">
                        {timeAgo(m.createdAt ?? Date.now())}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full" data-role="assistant">
                      <Logo variant="ai-avatar" className="mt-0.5 size-7 shrink-0" />
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5 text-[15px] leading-relaxed">
                        <div className="group/ai relative">
                          <MarkdownView>{text || "..."}</MarkdownView>
                          <button
                            onClick={() => speakMessage(m.id, text)}
                            className={cn(
                              "absolute top-0 right-0 p-1.5 rounded-md transition-colors opacity-0 group-hover/ai:opacity-100",
                              speakingMessageId === m.id
                                ? "text-accent bg-accent/10 opacity-100"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                            aria-label={speakingMessageId === m.id ? "Stop reading" : "Read aloud"}
                            title={speakingMessageId === m.id ? "Stop reading" : "Read aloud"}
                          >
                            {loadingSpeechId === m.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Volume2 className="size-4" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground/60">
                            {timeAgo(m.createdAt ?? Date.now())}
                          </span>
                          {!isLoading && text && (
                            <ConfidenceBadge text={text} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <Logo variant="ai-avatar" loading className="mt-0.5 size-7 shrink-0" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <span className="size-2 rounded-full bg-[#39FF14] animate-pulse" />
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error.message || "Something went wrong."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="px-4 lg:px-6 pb-4 pt-2 bg-background">
        <div className="mx-auto max-w-3xl">
          {/* Guest prompt limit banner */}
          {isGuest && !promptLimit.exhausted && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Free trial: <strong className="text-foreground">{promptLimit.remaining}</strong> of{" "}
                {promptLimit.freeLimit} prompts remaining
              </span>
              <Link
                to="/login"
                className="text-xs font-medium text-accent hover:underline"
              >
                Sign in for unlimited
              </Link>
            </div>
          )}

          {isGuest && promptLimit.exhausted ? (
            <div className="rounded-xl border border-accent/20 bg-card p-6 text-center">
              <Sparkles className="mx-auto size-8 text-accent mb-3" />
              <h3 className="text-lg font-semibold text-foreground">Free trial used up</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You&apos;ve used all {promptLimit.freeLimit} free prompts. Sign in to continue using Operiq AI.
              </p>
              <div className="mt-4 flex gap-3 justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  <LogIn className="size-4" />
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Create account
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* File chips */}
              {files.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 border border-accent/20 text-xs text-accent"
                    >
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <span className="text-accent/60">{formatFileSize(file.size)}</span>
                      <button
                        onClick={() => removeFile(idx)}
                        aria-label={`Remove ${file.name}`}
                        className="p-0.5 rounded hover:bg-accent/20"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input);
                }}
                className="relative rounded-xl border border-border bg-card shadow-sm focus-within:border-muted-foreground/50 transition-colors"
              >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 px-3 pt-2 pb-1">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-7 w-auto min-w-0 px-2 py-0 text-[11px] rounded-md bg-transparent border-0 text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-0 gap-1 shrink-0">
                      <Cpu className="size-3.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border min-w-[200px]">
                      {MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-sm cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">{m.label}</span>
                            <span className="text-[11px] text-muted-foreground">{m.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedPersonality.id} onValueChange={(id) => setSelectedPersonality(PERSONALITIES.find((p) => p.id === id) || PERSONALITIES[0])}>
                    <SelectTrigger className="h-7 w-auto min-w-0 px-2 py-0 text-[11px] rounded-md bg-transparent border-0 text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-0 gap-1 shrink-0">
                      <User className="size-3.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border min-w-[180px]">
                      {PERSONALITIES.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-sm cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">{p.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => setAgentMode((v) => !v)}
                    className={cn(
                      "shrink-0 size-7 rounded-md flex items-center justify-center transition-colors relative",
                      agentMode
                        ? "bg-accent text-white hover:bg-accent/90"
                        : "bg-transparent text-muted-foreground hover:bg-muted",
                    )}
                    aria-label={agentMode ? "Agent mode on" : "Agent mode off"}
                    title={agentMode ? "Agent mode: on" : "Agent mode: off"}
                  >
                    <Bot className="size-4" />
                    {selectedPersonality.id !== "default" && (
                      <span className="absolute -top-1 -right-1 size-2 rounded-full bg-accent" />
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="shrink-0 size-7 rounded-md bg-transparent text-muted-foreground hover:bg-muted flex items-center justify-center"
                        aria-label="Attach file"
                      >
                        <Paperclip className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Upload className="size-4 mr-2" />
                        Upload file
                      </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <LinkIcon className="size-4 mr-2" />
                    Upload from URL
                    <DropdownMenuShortcut>Coming soon</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                onClick={() => { setVoiceMode(!voiceMode); voiceModeRef.current = !voiceMode; if (!voiceMode) startVoiceLoop(); }}
                className={cn("p-1.5 rounded-md transition-colors", voiceMode ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-muted")}
                title="Voice mode"
              >
                <Headphones className="size-4" />
              </button>
              {typeof window !== "undefined" && location.protocol === "https:" && (
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    "shrink-0 size-7 rounded-md flex items-center justify-center transition-colors relative",
                    isRecording
                      ? "bg-destructive text-white hover:bg-destructive/90"
                      : "bg-transparent text-muted-foreground hover:bg-muted",
                  )}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                  title={isRecording ? "Stop recording" : "Record voice"}
                >
                  {isRecording ? (
                    <span className="size-2 rounded-full bg-foreground animate-pulse" />
                  ) : (
                    <Mic className="size-4" />
                  )}
                </button>
              )}
            </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(input);
                    }
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      submit(input);
                    }
                    if (e.key === "Escape") {
                      onShortcutsOpenChange(false);
                    }
                  }}
                  placeholder="Message Operiq AI..."
                  rows={1}
                  className="min-h-[44px] max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 px-3 py-3 pr-12 text-sm bg-transparent leading-relaxed"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || (input.trim().length === 0 && files.length === 0) || (isGuest && promptLimit.exhausted)}
                  aria-label="Send message"
                  className="absolute right-1.5 bottom-1.5 size-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowUp className="size-4" />
                  )}
                </Button>
              </form>

              {/* Voice mode indicator */}
              {voiceMode && (
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
                  <span className={cn(
                    "size-2 rounded-full animate-pulse",
                    voiceState === 'listening' && "bg-red-500",
                    voiceState === 'thinking' && "bg-yellow-500",
                    voiceState === 'speaking' && "bg-green-500",
                    voiceState === 'idle' && "bg-blue-500",
                  )} />
                  <span className="text-muted-foreground capitalize">{voiceState}</span>
                </div>
              )}
            </>
          )}

          {!promptLimit.exhausted && (
            <p className="mt-2 text-[11px] text-muted-foreground text-center">
              Operiq AI can make mistakes. Verify important information before acting.
              <br />
              &copy; 2025 Operiq AI. All rights reserved.
            </p>
          )}
        </div>
      </div>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        threadId={thread.id}
      />
    </section>
  );
}

function EmptyState({
  onPick,
  promptLimit,
  isGuest,
}: {
  onPick: (s: string) => void;
  promptLimit?: ReturnType<typeof usePromptLimit>;
  isGuest?: boolean;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <img src="/logo-full.png" alt="Operiq AI" className="mx-auto h-10 mb-4" />
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          What can I help with?
        </h2>

        {isGuest && !promptLimit?.exhausted && (
          <p className="mt-2 text-xs text-muted-foreground">
            Free trial: {promptLimit?.remaining} of {promptLimit?.freeLimit} prompts remaining
          </p>
        )}

        <div className="mt-8 grid sm:grid-cols-2 gap-2">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => onPick(q)}
              disabled={isGuest && !!promptLimit?.exhausted}
              className="text-left rounded-xl border border-border bg-card hover:bg-muted px-4 py-3 text-sm text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>

        {isGuest && promptLimit?.exhausted && (
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <LogIn className="size-4" />
              Sign in to continue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}