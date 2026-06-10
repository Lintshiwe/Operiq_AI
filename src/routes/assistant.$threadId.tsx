import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquareText,
  Plus,
  Send,
  Trash2,
  Loader2,
  ShieldCheck,
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownView } from "@/components/MarkdownView";
import { cn } from "@/lib/utils";
import {
  createBlankThread,
  deriveTitle,
  loadThreads,
  saveThreads,
  type Thread,
} from "@/lib/threads";

export const Route = createFileRoute("/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Assistant · FlowDesk AI" },
      { name: "description", content: "Workplace-focused conversational AI assistant." },
    ],
  }),
  component: AssistantThreadPage,
});

function AssistantThreadPage() {
  const { threadId } = useParams({ from: "/assistant/$threadId" });
  const navigate = useNavigate();

  // Bootstrap threads once — idempotent
  const [threads, setThreads] = useState<Thread[]>(() => {
    if (typeof window === "undefined") return [];
    const existing = loadThreads();
    if (existing.length === 0) {
      const t = createBlankThread();
      saveThreads([t]);
      return [t];
    }
    return existing;
  });

  const current = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId],
  );

  // If URL points to a missing thread, create it once
  useEffect(() => {
    if (current || typeof window === "undefined") return;
    const t: Thread = { ...createBlankThread(), id: threadId };
    setThreads((prev) => {
      const next = [t, ...prev];
      saveThreads(next);
      return next;
    });
  }, [current, threadId]);

  return (
    <AppShell>
      <div className="grid lg:grid-cols-[300px_1fr] min-h-[calc(100dvh-0px)] lg:h-dvh">
        <ThreadSidebar
          threads={threads}
          activeId={threadId}
          onCreate={() => {
            const t = createBlankThread();
            const next = [t, ...threads];
            setThreads(next);
            saveThreads(next);
            navigate({ to: "/assistant/$threadId", params: { threadId: t.id } });
          }}
          onDelete={(id) => {
            const next = threads.filter((t) => t.id !== id);
            setThreads(next);
            saveThreads(next);
            if (id === threadId) {
              const target = next[0]?.id;
              if (target) {
                navigate({ to: "/assistant/$threadId", params: { threadId: target } });
              } else {
                const t = createBlankThread();
                saveThreads([t]);
                setThreads([t]);
                navigate({ to: "/assistant/$threadId", params: { threadId: t.id } });
              }
            }
          }}
        />

        <ChatPane
          key={threadId}
          thread={current ?? { id: threadId, title: "New conversation", updatedAt: Date.now(), messages: [] }}
          onMessagesUpdate={(messages) => {
            setThreads((prev) => {
              const next = prev.map((t) =>
                t.id === threadId
                  ? { ...t, messages, updatedAt: Date.now(), title: deriveTitle(messages) }
                  : t,
              );
              saveThreads(next);
              return next;
            });
          }}
        />
      </div>
    </AppShell>
  );
}

/* ------------ Sidebar ------------ */

function ThreadSidebar({
  threads,
  activeId,
  onCreate,
  onDelete,
}: {
  threads: Thread[];
  activeId: string;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="border-r border-border bg-card/40 lg:h-dvh flex flex-col">
      <div className="px-5 py-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-accent">FlowDesk AI</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Conversations</h2>
        <Button
          onClick={onCreate}
          className="mt-4 w-full justify-center gap-2"
          variant="default"
        >
          <Plus className="size-4" /> New conversation
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="h-px bg-border" />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {threads.length === 0 && (
          <p className="px-3 py-6 text-xs text-muted-foreground">No conversations yet.</p>
        )}
        {threads.map((t) => {
          const active = t.id === activeId;
          return (
            <div
              key={t.id}
              className={cn(
                "group relative flex items-center gap-1 rounded-lg transition-colors",
                active ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <Link
                to="/assistant/$threadId"
                params={{ threadId: t.id }}
                className="flex-1 min-w-0 px-3 py-2.5 flex items-center gap-2.5"
              >
                <MessageSquareText
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-sm",
                      active ? "font-medium text-foreground" : "text-foreground/85",
                    )}
                  >
                    {t.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(t.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => onDelete(t.id)}
                aria-label={`Delete ${t.title}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity mr-1.5 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-border text-[11px] text-muted-foreground flex items-start gap-2">
        <ShieldCheck className="size-3.5 mt-0.5 shrink-0 text-primary" />
        <p>Conversations are stored only in this browser.</p>
      </div>
    </aside>
  );
}

/* ------------ Chat pane ------------ */

const QUICK_PROMPTS = [
  {
    label: "Draft a client follow-up",
    prompt: "Draft a polite, concise follow-up to a client who hasn't replied to my proposal in a week.",
  },
  {
    label: "Summarize meeting notes",
    prompt: "Summarize these raw meeting notes into decisions, action items, and deadlines:\n\n",
  },
  {
    label: "Plan a focused workday",
    prompt: "Help me plan a focused workday around 3 deep-work blocks and a 1:1.",
  },
  {
    label: "Prep for a QBR",
    prompt: "What sharp questions should I ask in an upcoming quarterly business review?",
  },
];

const SHORTCUTS = [
  { to: "/email", label: "Email Studio", hint: "Draft polished messages", icon: Mail },
  { to: "/meetings", label: "Meeting Intelligence", hint: "Notes → decisions & actions", icon: CalendarCheck2 },
  { to: "/planner", label: "Task Planner", hint: "Daily & weekly plans", icon: ListChecks },
  { to: "/research", label: "Research Hub", hint: "Summaries & insight", icon: BookOpen },
];

function ChatPane({
  thread,
  onMessagesUpdate,
}: {
  thread: Thread;
  onMessagesUpdate: (messages: UIMessage[]) => void;
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const isLoading = status === "submitted" || status === "streaming";

  async function submit(text: string) {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <section className="flex flex-col min-h-[60dvh] lg:h-dvh bg-background relative">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Assistant</p>
          <h1 className="mt-0.5 font-display text-xl font-semibold text-foreground truncate">
            {thread.title}
          </h1>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Ready
        </span>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className={cn("mx-auto max-w-3xl px-6 lg:px-10", isEmpty ? "py-12 lg:py-16" : "py-8 space-y-6")}>
          {isEmpty && <Welcome onPick={(s) => submit(s)} />}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                {isUser ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3 text-sm leading-relaxed shadow-soft">
                    {text}
                  </div>
                ) : (
                  <div className="max-w-[95%] w-full">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <span className="font-display text-[11px] font-semibold">F</span>
                      </span>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-secondary">
                        FlowDesk AI
                      </p>
                    </div>
                    <MarkdownView>{text || "…"}</MarkdownView>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Thinking…
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error.message || "Something went wrong."}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="relative flex items-end gap-2 rounded-2xl border border-border bg-card shadow-card p-2 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all"
          >
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
              placeholder="Ask FlowDesk AI anything about your workday…"
              rows={1}
              className="min-h-[44px] max-h-40 resize-none border-0 shadow-none focus-visible:ring-0 px-3 py-2.5 text-[15px] bg-transparent"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || input.trim().length === 0}
              aria-label="Send message"
              className="shrink-0 rounded-xl"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            AI may make mistakes or reflect bias — verify important information before acting.
          </p>
        </div>
      </div>
    </section>
  );
}

function Welcome({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div>
      {/* Hero */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-secondary">
          <span className="size-1.5 rounded-full bg-accent" /> Workplace Intelligence
        </span>
        <h2 className="mt-6 font-display text-4xl lg:text-5xl font-semibold text-foreground leading-[1.05]">
          Good to see you.
          <br />
          <span className="text-primary">What's on your desk?</span>
        </h2>
        <p className="mt-4 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          FlowDesk AI is your quiet operating system for the work around your work —
          drafting, summarizing, planning, and researching, end to end.
        </p>
      </div>

      {/* Quick prompts */}
      <div className="mt-10 grid sm:grid-cols-2 gap-2.5">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.label}
            onClick={() => onPick(q.prompt)}
            className="group text-left rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/40 px-4 py-3.5 transition-colors"
          >
            <p className="text-sm font-medium text-foreground">{q.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{q.prompt}</p>
          </button>
        ))}
      </div>

      {/* Module shortcuts */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-secondary">Specialized workspaces</p>
          <span className="flex-1 h-px bg-border" />
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to as "/email"}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/40 px-4 py-3 transition-colors"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.hint}</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
