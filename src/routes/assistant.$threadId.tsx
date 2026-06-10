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
import { MarkdownView } from "@/components/MarkdownView";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { deriveTitle, type Thread, loadThreads, saveThreads, createBlankThread } from "@/lib/threads";
import { MODELS, MODEL_STORAGE_KEY, MODEL_MAP } from "@/lib/models";

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

function AssistantThreadPage() {
  const { threadId } = useParams({ from: "/assistant/$threadId" });
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    const found = threads.find((t) => t._id === threadId);
    return found
      ? {
          id: found._id,
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

    const current = threads.find((t) => t._id === threadId);
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
      navigate({ to: "/assistant/$threadId", params: { threadId: threads[0]._id } });
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
      />
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
}: {
  threads: Thread[];
  activeId: string;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  isGuest?: boolean;
  className?: string;
}) {
  const groups = useMemo(() => groupThreads(threads), [threads]);

  return (
    <aside className={cn("w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border", className)}>
      {/* Logo area */}
      <div className="flex items-center justify-between gap-2 px-3 h-14">
        <div className="flex items-center gap-2">
          <img src="/logo-full.png" alt="Operiq AI" className="h-8" />
        </div>
        <button
          onClick={onClose}
          aria-label="Hide sidebar"
          className="p-1.5 rounded-md text-muted-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
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

      {/* Threads */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {threads.length === 0 && (
          <p className="px-3 py-6 text-xs text-muted-foreground">No conversations yet.</p>
        )}
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1 text-[11px] font-medium text-muted-foreground">{group.label}</p>
            <ul className="space-y-0.5">
              {group.threads.map((t) => {
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
                      className="block truncate pl-2.5 pr-9 py-2 text-sm text-sidebar-foreground"
                    >
                      {t.title}
                    </Link>
                    <button
                      onClick={() => onDelete(t.id)}
                      aria-label={`Delete ${t.title}`}
                      className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:bg-background hover:text-destructive transition-opacity",
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
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
    </aside>
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

function ChatPane({
  thread,
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  onMessagesUpdate,
  promptLimit,
  isGuest,
}: {
  thread: Thread;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onMessagesUpdate: (messages: UIMessage[]) => void;
  promptLimit: ReturnType<typeof usePromptLimit>;
  isGuest: boolean;
}) {
  /* ---- Model selector state ---- */
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window === "undefined") return MODELS[1].id;
    return window.localStorage.getItem(MODEL_STORAGE_KEY) || MODELS[1].id;
  });
  const modelRef = useRef(selectedModel);

  useEffect(() => {
    modelRef.current = selectedModel;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    }
  }, [selectedModel]);

  /* ---- Transport with model header ---- */
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => ({ "x-operiq-model": MODEL_MAP[modelRef.current] || modelRef.current }),
      }),
    []
  );

  const [input, setInput] = useState("");
  const [files, setFiles] = useState<{ name: string; size: number; content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const messageWithFiles = buildMessageWithFiles(value);
    setInput("");
    setFiles([]);
    await sendMessage({ text: messageWithFiles });
    setTimeout(() => inputRef.current?.focus(), 0);
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
                    <div className="max-w-[80%] rounded-2xl bg-card text-foreground px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap border border-border">
                      {text}
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full">
                      <Logo variant="ai-avatar" className="mt-0.5 size-7 shrink-0" />
                      <div className="min-w-0 flex-1 text-[15px] leading-relaxed">
                        <MarkdownView>{text || "..."}</MarkdownView>
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
                className="relative flex items-end rounded-xl border border-border bg-card shadow-sm focus-within:border-muted-foreground/50 transition-colors"
              >
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="h-8 w-auto min-w-0 px-2 py-0 text-[11px] rounded-lg bg-muted border-0 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/20 focus:ring-0 gap-1 shrink-0 ml-2 mb-1.5">
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 ml-1 mb-1.5 size-8 rounded-xl bg-muted text-muted-foreground hover:bg-muted-foreground/20 flex items-center justify-center"
                  aria-label="Attach file"
                >
                  <Paperclip className="size-4" />
                </button>
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