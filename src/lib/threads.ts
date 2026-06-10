import type { UIMessage } from "ai";

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "flowdesk.threads.v1";

function safeRead(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Thread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadThreads(): Thread[] {
  return safeRead().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(threads));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function newThreadId() {
  return (
    "t_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

export function createBlankThread(): Thread {
  return {
    id: newThreadId(),
    title: "New conversation",
    updatedAt: Date.now(),
    messages: [],
  };
}

export function deriveTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  const text = first.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "New conversation";
  return text.length > 48 ? text.slice(0, 48) + "…" : text;
}
