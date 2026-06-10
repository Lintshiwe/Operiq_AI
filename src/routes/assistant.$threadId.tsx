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
    <aside className="border-r border-border bg-card lg:h-dvh flex flex-col">
      <div className="px-5 py-5 border-b border-border flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-secondary">FlowDesk AI</p>
          <h2 className="font-display text-lg font-semibold">Conversations</h2>
        </div>
        <Button size="icon" variant="outline" onClick={onCreate} aria-label="New conversation">
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {threads.length === 0 && (
          <p className="px-3 py-6 text-xs text-muted-foreground">No conversations yet.</p>
        )}
        {threads.map((t) => {
          const active = t.id === activeId;
          return (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg px-1 transition-colors",
                active ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <Link
                to="/assistant/$threadId"
                params={{ threadId: t.id }}
                className="flex-1 min-w-0 px-2.5 py-2.5 flex items-center gap-2.5"
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
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => onDelete(t.id)}
                aria-label={`Delete ${t.title}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-border text-[11px] text-muted-foreground flex items-start gap-2">
        <ShieldCheck className="size-3.5 mt-0.5 shrink-0 text-secondary" />
        <p>Conversations are stored only in this browser.</p>
      </div>
    </aside>
  );
}

/* ------------ Chat pane ------------ */

const SUGGESTIONS = [
  "Draft a polite follow-up to a client who hasn't replied in a week.",
  "Summarize this meeting note into decisions and action items.",
  "Help me plan a focused work day around 3 deep-work blocks.",
  "What questions should I ask in a quarterly business review?",
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

  // Persist on changes
  useEffect(() => {
    if (status === "submitted" || status === "streaming") return;
    onMessagesUpdate(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Focus textarea
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

  return (
    <section className="flex flex-col min-h-[60dvh] lg:h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur px-6 lg:px-10 py-5">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">AI Assistant</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-foreground truncate">
          {thread.title}
        </h1>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 py-8 space-y-6">
          {messages.length === 0 && !isLoading && (
            <EmptyChat onPick={(s) => submit(s)} />
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                {isUser ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary text-primary-foreground px-4 py-3 text-sm leading-relaxed shadow-soft">
                    {text}
                  </div>
                ) : (
                  <div className="max-w-[95%] w-full">
                    <p className="mb-1.5 text-[11px] uppercase tracking-[0.22em] text-secondary">
                      FlowDesk AI
                    </p>
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
      <div className="border-t border-border bg-card/60 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="relative flex items-end gap-2 rounded-2xl border border-border bg-card shadow-soft p-2"
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
              placeholder="Ask FlowDesk AI…"
              rows={1}
              className="min-h-[44px] max-h-40 resize-none border-0 shadow-none focus-visible:ring-0 px-3 py-2.5 text-[15px] bg-transparent"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || input.trim().length === 0}
              aria-label="Send message"
              className="shrink-0"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            AI may make mistakes or reflect bias. Please verify important information before acting.
          </p>
        </div>
      </div>
    </section>
  );
}

function EmptyChat({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="py-10">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="font-display text-xl font-semibold">F</span>
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">
          How can FlowDesk help today?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Ask anything about your workday — drafting, summarizing, planning, or thinking out loud.
        </p>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/40 px-4 py-3.5 text-sm text-foreground transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
