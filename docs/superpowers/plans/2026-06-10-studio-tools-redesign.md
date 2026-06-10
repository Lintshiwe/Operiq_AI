# Studio Tool Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign 3 Studio tool pages (Meeting Intelligence, Task Planner, Research Hub) to match the Copilot-style single-column composer pattern from Email Studio.

**Architecture:** Each route file is rewritten as a single self-contained React component following the exact email.tsx pattern: inline imports, local AIDisclaimer, pill toggles, single-column layout, AI result card with copy/refine, loading skeleton, empty state, and Cmd+Enter keyboard shortcuts.

**Tech Stack:** React 19, TanStack Start, Tailwind CSS v4, lucide-react, shadcn/ui

---

## Task 1: Redesign Meeting Intelligence (`src/routes/meetings.tsx`)

**Files:**
- Modify: `src/routes/meetings.tsx` (complete rewrite)

- [ ] **Step 1: Rewrite meetings.tsx with single-column composer pattern**

Complete replacement of the file:

```tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarCheck2, Loader2, Copy, Check, ShieldCheck,
  Sparkles, SendHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { summarizeMeeting } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Intelligence \u00b7 Operiq AI" },
      {
        name: "description",
        content: "Summarize meetings — extract decisions, action items and deadlines.",
      },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [meetingType, setMeetingType] = useState<"1:1" | "team" | "client" | "all-hands">("team");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);
  const refineInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [modKey, setModKey] = useState("\u2318");

  useEffect(() => {
    setModKey(navigator.platform?.includes("Mac") ? "\u2318" : "Ctrl");
  }, []);

  async function onGenerate() {
    if (notes.trim().length < 20) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await run({ data: { notes, meetingType } });
      setOutput(res.text);
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onRefine() {
    if (!output || !refineText.trim()) return;
    setRefining(true);
    try {
      const res = await run({
        data: {
          notes: `Revise this briefing: ${output}\n\nRequested changes: ${refineText}`,
          meetingType: "",
        },
      });
      setOutput(res.text);
      setRefineText("");
    } catch (e) {
      toast.error("Refinement failed. Please try again.");
      console.error(e);
    } finally {
      setRefining(false);
    }
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (refineInputRef.current === document.activeElement) {
          e.preventDefault();
          onRefine();
        } else {
          e.preventDefault();
          onGenerate();
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [notes, meetingType, output, refineText]);

  useEffect(() => {
    if (output && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [output]);

  const meetingTypes = [
    { value: "1:1" as const, label: "1:1" },
    { value: "team" as const, label: "Team Sync" },
    { value: "client" as const, label: "Client Call" },
    { value: "all-hands" as const, label: "All-Hands" },
  ];

  function pillClass(active: boolean) {
    return active
      ? "bg-accent text-accent-foreground shadow-sm"
      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50";
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[680px] mx-auto px-6 py-8 lg:py-10">
            {/* Minimal header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <CalendarCheck2 className="size-4" />
                </span>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">Meeting Intelligence</h1>
                  <p className="text-xs text-muted-foreground">Summarize meetings — extract decisions, action items and deadlines</p>
                </div>
              </div>
            </div>

            {/* Meeting type pills */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mr-1">
                  Type
                </span>
                {meetingTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setMeetingType(t.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${pillClass(meetingType === t.value)}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes textarea */}
            <div className="mb-5">
              <textarea
                placeholder="Paste meeting transcript or rough notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={12}
                className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-vertical focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            {/* Generate button + shortcut hint */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onGenerate}
                disabled={loading || refining || notes.trim().length < 20}
                className="rounded-xl px-5"
              >
                {loading ? (
                  <><Loader2 className="size-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="size-4" /> Generate briefing</>
                )}
              </Button>
              <span className="text-xs text-muted-foreground/50">
                or press{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[11px] font-mono text-muted-foreground">
                  {modKey}+Enter
                </kbd>
              </span>
            </div>

            {/* Loading skeleton */}
            {loading && !output && (
              <div className="mt-10 space-y-3 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-7 rounded-lg bg-muted/50" />
                  <div className="h-3 w-40 rounded bg-muted/50" />
                  <div className="h-3 w-16 rounded bg-muted/30" />
                </div>
                {[85, 70, 90, 55, 75, 60, 80].map((w, i) => (
                  <div key={i} className="h-2.5 rounded bg-muted/40" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {/* Result */}
            {output && (
              <div ref={resultRef} className="mt-10">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="size-2 rounded-full bg-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">Operiq AI</span>
                        <span className="text-[10px] text-muted-foreground/50">\u00b7</span>
                        <span className="text-[11px] text-muted-foreground/50">Just now</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs gap-1">
                          {copied ? (
                            <><Check className="size-3.5 text-accent" /> Copied</>
                          ) : (
                            <><Copy className="size-3.5" /> Copy</>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-card/30 border border-border/50 px-5 py-4">
                      <div className="prose-flow prose-sm max-w-none">
                        <MarkdownView>{output}</MarkdownView>
                      </div>
                    </div>

                    {/* Refine input */}
                    <div className="mt-3 flex items-center gap-2 bg-card/30 border border-border/50 rounded-xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
                      <input
                        ref={refineInputRef}
                        type="text"
                        placeholder="Tell Operiq how to improve this briefing..."
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            onRefine();
                          }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
                      />
                      <button
                        type="button"
                        onClick={onRefine}
                        disabled={refining || !refineText.trim()}
                        className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-30 shrink-0"
                      >
                        {refining ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <SendHorizontal className="size-3.5" />
                        )}
                      </button>
                    </div>

                    <AIDisclaimer />
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!output && !loading && (
              <div className="mt-16 text-center">
                <div className="size-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="size-4 text-accent/60" />
                </div>
                <p className="text-sm text-muted-foreground/50">
                  Paste meeting notes and click Generate briefing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AIDisclaimer() {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] text-muted-foreground/60">
      <ShieldCheck className="size-3 mt-0.5 shrink-0" />
      <p>AI-generated summary. Review for accuracy, tone, and potential bias before acting on it.</p>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `bun run build`
Expected: No compilation errors from meetings.tsx

- [ ] **Step 3: Commit**

```bash
git add src/routes/meetings.tsx
git commit -m "feat: redesign Meeting Intelligence as single-column composer"
```

---

## Task 2: Redesign Task Planner (`src/routes/planner.tsx`)

**Files:**
- Modify: `src/routes/planner.tsx` (complete rewrite)

- [ ] **Step 4: Rewrite planner.tsx with single-column composer pattern**

Complete replacement of the file:

```tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ListChecks, Loader2, Copy, Check, ShieldCheck,
  Sparkles, SendHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { planTasks } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner \u00b7 Operiq AI" },
      { name: "description", content: "Generate prioritized daily and weekly plans." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [horizon, setHorizon] = useState<"daily" | "weekly">("daily");
  const [tasks, setTasks] = useState("");
  const [goals, setGoals] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);
  const refineInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [modKey, setModKey] = useState("\u2318");

  useEffect(() => {
    setModKey(navigator.platform?.includes("Mac") ? "\u2318" : "Ctrl");
  }, []);

  async function onGenerate() {
    if (tasks.trim().length < 5) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await run({ data: { horizon, tasks, goals } });
      setOutput(res.text);
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onRefine() {
    if (!output || !refineText.trim()) return;
    setRefining(true);
    try {
      const res = await run({
        data: {
          horizon,
          tasks: `Previous plan:\n${output}\n\nRequested changes: ${refineText}`,
          goals: "",
        },
      });
      setOutput(res.text);
      setRefineText("");
    } catch (e) {
      toast.error("Refinement failed. Please try again.");
      console.error(e);
    } finally {
      setRefining(false);
    }
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (refineInputRef.current === document.activeElement) {
          e.preventDefault();
          onRefine();
        } else {
          e.preventDefault();
          onGenerate();
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [horizon, tasks, goals, output, refineText]);

  useEffect(() => {
    if (output && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [output]);

  const horizons = [
    { value: "daily" as const, label: "Daily" },
    { value: "weekly" as const, label: "Weekly" },
  ];

  function pillClass(active: boolean) {
    return active
      ? "bg-accent text-accent-foreground shadow-sm"
      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50";
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[680px] mx-auto px-6 py-8 lg:py-10">
            {/* Minimal header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <ListChecks className="size-4" />
                </span>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">Task Planner</h1>
                  <p className="text-xs text-muted-foreground">Generate prioritized daily and weekly plans</p>
                </div>
              </div>
            </div>

            {/* Horizon pills */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mr-1">
                  Horizon
                </span>
                {horizons.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => setHorizon(h.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${pillClass(horizon === h.value)}`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks textarea */}
            <div className="mb-5">
              <textarea
                placeholder="List your tasks (one per line)..."
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                rows={8}
                className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-vertical focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            {/* Goals textarea */}
            <div className="mb-5">
              <textarea
                placeholder="Goals or context (optional)"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={3}
                className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-vertical focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            {/* Generate button + shortcut hint */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onGenerate}
                disabled={loading || refining || tasks.trim().length < 5}
                className="rounded-xl px-5"
              >
                {loading ? (
                  <><Loader2 className="size-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="size-4" /> Generate plan</>
                )}
              </Button>
              <span className="text-xs text-muted-foreground/50">
                or press{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[11px] font-mono text-muted-foreground">
                  {modKey}+Enter
                </kbd>
              </span>
            </div>

            {/* Loading skeleton */}
            {loading && !output && (
              <div className="mt-10 space-y-3 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-7 rounded-lg bg-muted/50" />
                  <div className="h-3 w-40 rounded bg-muted/50" />
                  <div className="h-3 w-16 rounded bg-muted/30" />
                </div>
                {[85, 70, 90, 55, 75, 60, 80].map((w, i) => (
                  <div key={i} className="h-2.5 rounded bg-muted/40" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {/* Result */}
            {output && (
              <div ref={resultRef} className="mt-10">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="size-2 rounded-full bg-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">Operiq AI</span>
                        <span className="text-[10px] text-muted-foreground/50">\u00b7</span>
                        <span className="text-[11px] text-muted-foreground/50">Just now</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs gap-1">
                          {copied ? (
                            <><Check className="size-3.5 text-accent" /> Copied</>
                          ) : (
                            <><Copy className="size-3.5" /> Copy</>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-card/30 border border-border/50 px-5 py-4">
                      <div className="prose-flow prose-sm max-w-none">
                        <MarkdownView>{output}</MarkdownView>
                      </div>
                    </div>

                    {/* Refine input */}
                    <div className="mt-3 flex items-center gap-2 bg-card/30 border border-border/50 rounded-xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
                      <input
                        ref={refineInputRef}
                        type="text"
                        placeholder="Tell Operiq how to improve this plan..."
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            onRefine();
                          }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
                      />
                      <button
                        type="button"
                        onClick={onRefine}
                        disabled={refining || !refineText.trim()}
                        className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-30 shrink-0"
                      >
                        {refining ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <SendHorizontal className="size-3.5" />
                        )}
                      </button>
                    </div>

                    <AIDisclaimer />
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!output && !loading && (
              <div className="mt-16 text-center">
                <div className="size-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="size-4 text-accent/60" />
                </div>
                <p className="text-sm text-muted-foreground/50">
                  Add your tasks and click Generate plan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AIDisclaimer() {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] text-muted-foreground/60">
      <ShieldCheck className="size-3 mt-0.5 shrink-0" />
      <p>AI-generated plan. Review for feasibility and adjust based on your actual workload.</p>
    </div>
  );
}
```

- [ ] **Step 5: Build and verify**

Run: `bun run build`
Expected: No compilation errors from planner.tsx

- [ ] **Step 6: Commit**

```bash
git add src/routes/planner.tsx
git commit -m "feat: redesign Task Planner as single-column composer"
```

---

## Task 3: Redesign Research Hub (`src/routes/research.tsx`)

**Files:**
- Modify: `src/routes/research.tsx` (complete rewrite)

- [ ] **Step 7: Rewrite research.tsx with single-column composer pattern**

Complete replacement of the file:

```tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpen, Loader2, Copy, Check, ShieldCheck,
  Sparkles, SendHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { analyzeResearch } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Hub \u00b7 Operiq AI" },
      { name: "description", content: "Summarize research, surface insights, and generate recommendations." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(analyzeResearch);
  const [material, setMaterial] = useState("");
  const [question, setQuestion] = useState("");
  const [depth, setDepth] = useState<"quick" | "deep" | "executive">("quick");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);
  const refineInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [modKey, setModKey] = useState("\u2318");

  useEffect(() => {
    setModKey(navigator.platform?.includes("Mac") ? "\u2318" : "Ctrl");
  }, []);

  async function onGenerate() {
    if (material.trim().length < 20) return;
    setLoading(true);
    setOutput(null);
    try {
      const res = await run({ data: { material, question, depth } });
      setOutput(res.text);
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onRefine() {
    if (!output || !refineText.trim()) return;
    setRefining(true);
    try {
      const res = await run({
        data: {
          material: `Previous analysis:\n${output}\n\nRequested changes: ${refineText}`,
          question: "",
          depth,
        },
      });
      setOutput(res.text);
      setRefineText("");
    } catch (e) {
      toast.error("Refinement failed. Please try again.");
      console.error(e);
    } finally {
      setRefining(false);
    }
  }

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (refineInputRef.current === document.activeElement) {
          e.preventDefault();
          onRefine();
        } else {
          e.preventDefault();
          onGenerate();
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [material, question, depth, output, refineText]);

  useEffect(() => {
    if (output && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [output]);

  const depths = [
    { value: "quick" as const, label: "Quick Summary" },
    { value: "deep" as const, label: "Deep Analysis" },
    { value: "executive" as const, label: "Executive Brief" },
  ];

  function pillClass(active: boolean) {
    return active
      ? "bg-accent text-accent-foreground shadow-sm"
      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50";
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[680px] mx-auto px-6 py-8 lg:py-10">
            {/* Minimal header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <BookOpen className="size-4" />
                </span>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">Research Hub</h1>
                  <p className="text-xs text-muted-foreground">Summarize research, surface insights, and generate recommendations</p>
                </div>
              </div>
            </div>

            {/* Depth pills */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mr-1">
                  Depth
                </span>
                {depths.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDepth(d.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${pillClass(depth === d.value)}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Material textarea */}
            <div className="mb-5">
              <textarea
                placeholder="Paste report, article, or transcript..."
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                rows={10}
                className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-vertical focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            {/* Question input */}
            <div className="mb-5">
              <input
                type="text"
                placeholder="Focus question (optional)"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            {/* Generate button + shortcut hint */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onGenerate}
                disabled={loading || refining || material.trim().length < 20}
                className="rounded-xl px-5"
              >
                {loading ? (
                  <><Loader2 className="size-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="size-4" /> Generate analysis</>
                )}
              </Button>
              <span className="text-xs text-muted-foreground/50">
                or press{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[11px] font-mono text-muted-foreground">
                  {modKey}+Enter
                </kbd>
              </span>
            </div>

            {/* Loading skeleton */}
            {loading && !output && (
              <div className="mt-10 space-y-3 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-7 rounded-lg bg-muted/50" />
                  <div className="h-3 w-40 rounded bg-muted/50" />
                  <div className="h-3 w-16 rounded bg-muted/30" />
                </div>
                {[85, 70, 90, 55, 75, 60, 80].map((w, i) => (
                  <div key={i} className="h-2.5 rounded bg-muted/40" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {/* Result */}
            {output && (
              <div ref={resultRef} className="mt-10">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="size-2 rounded-full bg-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">Operiq AI</span>
                        <span className="text-[10px] text-muted-foreground/50">\u00b7</span>
                        <span className="text-[11px] text-muted-foreground/50">Just now</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs gap-1">
                          {copied ? (
                            <><Check className="size-3.5 text-accent" /> Copied</>
                          ) : (
                            <><Copy className="size-3.5" /> Copy</>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-card/30 border border-border/50 px-5 py-4">
                      <div className="prose-flow prose-sm max-w-none">
                        <MarkdownView>{output}</MarkdownView>
                      </div>
                    </div>

                    {/* Refine input */}
                    <div className="mt-3 flex items-center gap-2 bg-card/30 border border-border/50 rounded-xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
                      <input
                        ref={refineInputRef}
                        type="text"
                        placeholder="Tell Operiq how to improve this analysis..."
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            onRefine();
                          }
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
                      />
                      <button
                        type="button"
                        onClick={onRefine}
                        disabled={refining || !refineText.trim()}
                        className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-30 shrink-0"
                      >
                        {refining ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <SendHorizontal className="size-3.5" />
                        )}
                      </button>
                    </div>

                    <AIDisclaimer />
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!output && !loading && (
              <div className="mt-16 text-center">
                <div className="size-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="size-4 text-accent/60" />
                </div>
                <p className="text-sm text-muted-foreground/50">
                  Paste material and click Generate analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AIDisclaimer() {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] text-muted-foreground/60">
      <ShieldCheck className="size-3 mt-0.5 shrink-0" />
      <p>AI-generated analysis. Verify key facts and consider potential biases in the source material.</p>
    </div>
  );
}
```

- [ ] **Step 8: Build and verify**

Run: `bun run build`
Expected: No compilation errors from research.tsx

- [ ] **Step 9: Commit**

```bash
git add src/routes/research.tsx
git commit -m "feat: redesign Research Hub as single-column composer"
```

---

## Final Verification

- [ ] **Step 10: Full build verification**

Run: `bun run build`
Expected: Clean build with zero errors across all 3 files.

- [ ] **Step 11: Final report**

Report build output to user.
