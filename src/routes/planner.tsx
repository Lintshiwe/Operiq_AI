/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Sparkles, Star, CalendarDays, Lightbulb, ListChecks,
  Copy, Check, Download, ShieldCheck, Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: (search.prefill as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Task Planner \u00b7 Operiq AI" },
      { name: "description", content: "Generate prioritized daily and weekly plans." },
    ],
  }),
  component: PlannerPage,
});

function parsePlan(text: string) {
  const priorities: string[] = [];
  const overview: string[] = [];
  const suggestions: string[] = [];

  const lines = text.split("\n");
  let section: "none" | "priorities" | "overview" | "suggestions" = "none";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/^priorities[:\s]/.test(lower)) {
      section = "priorities";
      continue;
    }
    if (/^overview[:\s]/.test(lower)) {
      section = "overview";
      continue;
    }
    if (/^suggestions[:\s]/.test(lower)) {
      section = "suggestions";
      continue;
    }
    if (line.trim().startsWith("-") || /^\d+\.\s/.test(line.trim())) {
      const item = line.replace(/^[-\d.\s]+/, "").trim();
      if (!item) continue;
      if (section === "priorities") priorities.push(item);
      else if (section === "overview") overview.push(item);
      else if (section === "suggestions") suggestions.push(item);
    } else if (line.trim()) {
      // Non-list line within a section — treat as a single item if in section
      if (section === "priorities") priorities.push(line.trim());
      else if (section === "overview") overview.push(line.trim());
      else if (section === "suggestions") suggestions.push(line.trim());
    }
  }

  const fallback = !priorities.length && !overview.length && !suggestions.length;
  return { priorities, overview, suggestions, fallback };
}

function PlannerPage() {
  const { prefill } = Route.useSearch();
  const generate = useMutation(api.plans.generate);
  const [horizon, setHorizon] = useState<"Day" | "Week" | "Month">("Day");
  const [tasks, setTasks] = useState(prefill || "");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefill) setTasks(prefill);
  }, [prefill]);

  async function handleGenerate() {
    if (tasks.trim().length < 5) return;
    setLoading(true);
    setOutput(null);
    try {
      const convexHorizon = horizon === "Day" ? "daily" : horizon === "Week" ? "weekly" : "monthly";
      const result = await generate({
        horizon: convexHorizon as "daily" | "weekly" | "monthly",
        tasks,
        goals: "",
      });
      setOutput(result.text);
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  }

  function exportPlan() {
    if (!output) return;
    const date = new Date().toLocaleString();
    const content = `Operiq AI Task Plan — Generated on ${date}\n${"=".repeat(60)}\n\n${output}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `operiq-plan-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Plan exported");
  }

  const parsed = output ? parsePlan(output) : null;
  const priorities = parsed?.priorities ?? [];
  const overview = parsed?.overview ?? [];
  const suggestions = parsed?.suggestions ?? [];
  const fallback = parsed?.fallback ?? true;

  const horizons: Array<"Day" | "Week" | "Month"> = ["Day", "Week", "Month"];

  return (
    <AppShell>
      <div className="h-full flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-[720px] space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Task Planner</h1>
            <p className="text-sm text-muted-foreground">Generate prioritized daily and weekly plans</p>
          </div>

          {/* Horizon pills */}
          <div className="flex justify-center gap-2">
            {horizons.map((h) => (
              <Button
                key={h}
                variant={h === horizon ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setHorizon(h)}
              >
                {h}
              </Button>
            ))}
          </div>

          {/* Input */}
          <Textarea
            placeholder="Describe your goals, tasks, and constraints..."
            rows={6}
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
          />

          {/* Generate */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={loading || tasks.trim().length < 5}
              className="rounded-full px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ListChecks className="size-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          </div>

          {/* Loading skeleton */}
          {loading && !output && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-muted/50" />
                    <div className="h-4 w-32 rounded bg-muted/50" />
                  </div>
                  {[80, 60, 70, 50].map((w, j) => (
                    <div key={j} className="h-2.5 rounded bg-muted/40" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {output && !fallback && (
            <div className="space-y-4">
              {/* Copy / Export */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs gap-1">
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-accent" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={exportPlan} className="h-7 px-2 text-xs gap-1">
                  <Download className="size-3.5" /> Export
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Today's Priorities */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="size-5 text-red-400" />
                    <h3 className="text-sm font-semibold text-foreground">Today&apos;s Priorities</h3>
                  </div>
                  <ul className="space-y-2">
                    {priorities.length ? (
                      priorities.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-red-400/50 shrink-0" />
                          {p}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground/60">No priorities found.</li>
                    )}
                  </ul>
                </div>

                {/* Weekly Overview */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-5 text-blue-400" />
                    <h3 className="text-sm font-semibold text-foreground">Weekly Overview</h3>
                  </div>
                  {overview.length ? (
                    <ul className="space-y-2">
                      {overview.map((o, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-blue-400/50 shrink-0" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                        <div key={d} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-8">{d}</span>
                          <div className="flex-1 h-2 rounded-full bg-blue-400/20">
                            <div
                              className="h-full rounded-full bg-blue-400/60"
                              style={{ width: `${Math.floor(Math.random() * 80 + 20)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Smart Suggestions */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="size-5 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-foreground">Smart Suggestions</h3>
                  </div>
                  <ul className="space-y-2">
                    {suggestions.length ? (
                      suggestions.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-yellow-400/50 shrink-0" />
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground/60">No suggestions found.</li>
                    )}
                  </ul>
                </div>
              </div>

              <AIDisclaimer />
            </div>
          )}

          {/* Fallback: all in first card */}
          {output && fallback && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs gap-1">
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-accent" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={exportPlan} className="h-7 px-2 text-xs gap-1">
                  <Download className="size-3.5" /> Export
                </Button>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="size-5 text-red-400" />
                  <h3 className="text-sm font-semibold text-foreground">Plan</h3>
                </div>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{output}</pre>
              </div>
              <AIDisclaimer />
            </div>
          )}

          {/* Empty state */}
          {!output && !loading && (
            <div className="mt-16 text-center">
              <div className="size-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="size-4 text-accent/60" />
              </div>
              <p className="text-sm text-muted-foreground/50">
                Add your tasks and click Generate Plan
              </p>
            </div>
          )}
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
