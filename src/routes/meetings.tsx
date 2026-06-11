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
  CheckCircle2, ListChecks, Calendar, Copy, Check, Sparkles, ShieldCheck, CalendarCheck2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: (search.prefill as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Meeting Intelligence \u00b7 Operiq AI" },
      {
        name: "description",
        content: "Summarize meetings \u2014 extract decisions, action items and deadlines.",
      },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const { prefill } = Route.useSearch();
  const generate = useMutation(api.summaries.generate);
  const [notes, setNotes] = useState(prefill || "");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (notes.trim().length < 20) return;
    setLoading(true);
    setOutput(null);
    try {
      const result = await generate({ notes, meetingType: "team" });
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
        handleGenerate();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [notes]);

  const sections = parseSections(output);

  return (
    <AppShell>
      <div className="h-full flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-[720px] space-y-8">
          {/* Title + subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Meeting Intelligence</h1>
            <p className="text-sm text-muted-foreground">Summarize meetings — extract decisions, action items and deadlines</p>
          </div>

          {/* Input */}
          <Textarea
            placeholder="Paste your meeting notes here..."
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-card border-border/60 text-foreground placeholder:text-muted-foreground/40 resize-y"
          />
          
          {/* Generate button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={loading || notes.trim().length < 20}
              className="rounded-full px-8 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? (
                <CalendarCheck2 className="size-4 mr-2 animate-spin" />
              ) : (
                <CalendarCheck2 className="size-4 mr-2" />
              )}
              Generate Summary
            </Button>
          </div>

          {/* Loading skeleton */}
          {loading && !output && (
            <div className="space-y-3 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-3">
                    <div className="h-4 w-32 rounded bg-muted/50" />
                    <div className="h-3 w-full rounded bg-muted/30" />
                    <div className="h-3 w-4/5 rounded bg-muted/30" />
                    <div className="h-3 w-3/4 rounded bg-muted/30" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Three cards */}
          {output && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Key Decisions */}
                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-blue-400" />
                      <CardTitle className="text-sm font-semibold">Key Decisions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {sections.decisions.length > 0 ? (
                        sections.decisions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 size-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground">{output}</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <ListChecks className="size-5 text-blue-400" />
                      <CardTitle className="text-sm font-semibold">Action Items</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {sections.actions.length > 0 ? (
                        sections.actions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 size-3 rounded-sm border border-blue-400/60 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground/50 italic">No action items found</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="bg-card border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-5 text-blue-400" />
                      <CardTitle className="text-sm font-semibold">Upcoming Deadlines</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {sections.deadlines.length > 0 ? (
                        sections.deadlines.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 size-3 rounded-sm border border-blue-400/60 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground/50 italic">No deadlines found</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Copy button + Disclaimer */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs gap-1">
                  {copied ? (
                    <><Check className="size-3.5 text-[#10a37f]" /> Copied</>
                  ) : (
                    <><Copy className="size-3.5" /> Copy</>
                  )}
                </Button>
                <AIDisclaimer />
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
                Paste meeting notes and click Generate Summary
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function parseSections(text: string | null) {
  if (!text) return { decisions: [] as string[], actions: [] as string[], deadlines: [] as string[] };

  const lines = text.split('\n');
  const sections = { decisions: [] as string[], actions: [] as string[], deadlines: [] as string[] };
  let currentSection: 'decisions' | 'actions' | 'deadlines' | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();

    if (lower.includes('key decision') || lower.includes('decisions') || lower.includes('decision made')) {
      currentSection = 'decisions';
      continue;
    }
    if (lower.includes('action item') || lower.includes('actions') || lower.includes('to-do') || lower.includes('todo')) {
      currentSection = 'actions';
      continue;
    }
    if (lower.includes('deadline') || lower.includes('due date') || lower.includes('upcoming')) {
      currentSection = 'deadlines';
      continue;
    }

    if (currentSection && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./))) {
      const clean = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (clean) sections[currentSection].push(clean);
    } else if (currentSection && trimmed) {
      if (trimmed.length > 10) {
        sections[currentSection].push(trimmed);
      }
    }
  }

  // If no sections found at all, return the whole text as a single decision
  if (sections.decisions.length === 0 && sections.actions.length === 0 && sections.deadlines.length === 0) {
    return { decisions: [text], actions: [], deadlines: [] };
  }

  return sections;
}

function AIDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] text-muted-foreground/60">
      <ShieldCheck className="size-3 mt-0.5 shrink-0" />
      <p>AI-generated summary. Review for accuracy, tone, and potential bias before acting on it.</p>
    </div>
  );
}
