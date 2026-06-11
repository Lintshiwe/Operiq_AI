/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Lightbulb, FileText, TrendingUp, Sparkles, BookOpen,
  Copy, Check, ShieldCheck, Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: (search.prefill as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Research Hub \u00b7 Operiq AI" },
      { name: "description", content: "Analyze reports, articles, and topics with AI-powered insights." },
    ],
  }),
  component: ResearchPage,
});

function parseSections(text: string) {
  const insights: string[] = [];
  const summary: string[] = [];
  const recommendations: string[] = [];

  const lines = text.split("\n");
  let section: "none" | "insights" | "summary" | "recommendations" = "none";

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (!lower) continue;

    if (/^insights?[\s:]/.test(lower)) {
      section = "insights";
      continue;
    }
    if (/^summary?[\s:]/.test(lower)) {
      section = "summary";
      continue;
    }
    if (/^recommendations?[\s:]/.test(lower)) {
      section = "recommendations";
      continue;
    }

    if (line.trim().startsWith("-") || line.trim().startsWith("\u2022") || /^\d+\.\s/.test(line.trim())) {
      const item = line.replace(/^[-\u2022\d.\s]+/, "").trim();
      if (!item) continue;
      if (section === "insights") insights.push(item);
      else if (section === "summary") summary.push(item);
      else if (section === "recommendations") recommendations.push(item);
    } else if (line.trim()) {
      if (section === "insights") insights.push(line.trim());
      else if (section === "summary") summary.push(line.trim());
      else if (section === "recommendations") recommendations.push(line.trim());
    }
  }

  const fallback = !insights.length && !summary.length && !recommendations.length;
  return { insights, summary, recommendations, fallback };
}

function ResearchPage() {
  const { prefill } = Route.useSearch();
  const generate = useAction(api.analyses.generate);
  const [material, setMaterial] = useState(prefill || "");
  const [depth, setDepth] = useState<"brief" | "standard" | "deep">("standard");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modKey, setModKey] = useState("\u2318");

  useEffect(() => {
    setModKey(navigator.platform?.includes("Mac") ? "\u2318" : "Ctrl");
  }, []);

  async function onGenerate() {
    if (material.trim().length < 20) return;
    setLoading(true);
    setOutput(null);
    try {
      const convexDepth = depth === "brief" ? "quick" : depth === "deep" ? "deep" : "executive";
      const result = await generate({
        material,
        question: "",
        depth: convexDepth as "quick" | "deep" | "executive",
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

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onGenerate();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [material, depth]);

  const parsed = output ? parseSections(output) : null;
  const insights = parsed?.insights ?? [];
  const summary = parsed?.summary ?? [];
  const recommendations = parsed?.recommendations ?? [];
  const fallback = parsed?.fallback ?? true;

  const depths = [
    { value: "brief" as const, label: "Brief" },
    { value: "standard" as const, label: "Standard" },
    { value: "deep" as const, label: "Deep Dive" },
  ];

  function pillClass(active: boolean) {
    return active
      ? "bg-accent text-accent-foreground shadow-sm"
      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50";
  }

  return (
    <AppShell>
      <div className="h-full flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-[720px] space-y-8">
          {/* Title + subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Research Hub</h1>
            <p className="text-sm text-muted-foreground">
              Analyze reports, articles, and topics with AI-powered insights
            </p>
          </div>

          {/* Depth pills */}
          <div className="flex justify-center gap-2">
            {depths.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDepth(d.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${pillClass(depth === d.value)}`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Material textarea */}
          <Textarea
            placeholder="Paste report, article, or research material here..."
            rows={10}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="bg-card border-border/60 text-foreground placeholder:text-muted-foreground/40 resize-y"
          />

          {/* Generate button */}
          <div className="flex justify-center">
            <Button
              onClick={onGenerate}
              disabled={loading || material.trim().length < 20}
              className="rounded-full px-8 bg-[#10a37f] text-white hover:bg-[#10a37f]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BookOpen className="size-4 mr-2" />
                  Generate Analysis
                </>
              )}
            </Button>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[11px] font-mono text-muted-foreground">
                {modKey}+Enter
              </kbd>{" "}
              to generate
            </span>
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

          {/* Three cards */}
          {output && !fallback && (
            <div className="space-y-6">
              {/* Copy button */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs gap-1">
                  {copied ? (
                    <><Check className="size-3.5 text-[#10a37f]" /> Copied</>
                  ) : (
                    <><Copy className="size-3.5" /> Copy</>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Key Insights */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="size-5 text-blue-400" />
                    <h3 className="text-sm font-semibold text-foreground">Key Insights</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.length > 0 ? (
                      insights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 size-1.5 rounded-full bg-blue-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground/60">No insights found.</li>
                    )}
                  </ul>
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-green-400" />
                    <h3 className="text-sm font-semibold text-foreground">Summary</h3>
                  </div>
                  <div className="space-y-2">
                    {summary.length > 0 ? (
                      summary.map((item, i) => (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                          {item}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground/60">No summary found.</p>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {recommendations.length > 0 ? (
                      recommendations.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1 size-3 rounded-sm border border-yellow-400/60 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground/60">No recommendations found.</li>
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
                    <><Check className="size-3.5 text-[#10a37f]" /> Copied</>
                  ) : (
                    <><Copy className="size-3.5" /> Copy</>
                  )}
                </Button>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-blue-400" />
                  <h3 className="text-sm font-semibold text-foreground">Analysis</h3>
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
                Paste research material and click Generate Analysis
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
      <p>AI-generated analysis. Verify key facts and consider potential biases in the source material.</p>
    </div>
  );
}
