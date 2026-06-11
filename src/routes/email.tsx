/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useSsrConvexAuth } from "@/lib/use-ssr-convex-auth";
import { api } from "../../convex/_generated/api";
import {
  Mail, Loader2, Copy, Check, ShieldCheck,
  Sparkles, X, SendHorizontal, Send,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Studio \u00b7 Operiq AI" },
      {
        name: "description",
        content: "Compose polished professional emails with AI assistance.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const generate = useMutation(api.emailDrafts.generate);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState<"formal" | "informal" | "persuasive">("informal");
  const [audience, setAudience] = useState<"client" | "manager" | "team">("client");
  const [context, setContext] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);
  const [sending, setSending] = useState(false);
  const refineInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useSsrConvexAuth();
  const user = useQuery(api.users.me);
  const [modKey, setModKey] = useState("\u2318");

  useEffect(() => {
    setModKey(navigator.platform?.includes("Mac") ? "\u2318" : "Ctrl");
  }, []);

  async function onGenerate() {
    const topic = subject || "Email draft";
    if (topic.trim().length < 2) return;
    setLoading(true);
    setDraft(null);
    try {
      const result = await generate({
        recipient: recipient || "",
        subject: subject || "",
        tone,
        audience,
        context,
      });
      setDraft(result.draft);
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onRefine() {
    if (!draft || !refineText.trim()) return;
    setRefining(true);
    try {
      const result = await generate({
        recipient: recipient || "",
        subject: `[REFINED] ${subject || "Email draft"}`,
        tone,
        audience,
        context: `Previous draft:\n${draft}\n\nRequested changes: ${refineText}`,
      });
      setDraft(result.draft);
      setRefineText("");
    } catch (e) {
      toast.error("Refinement failed. Please try again.");
      console.error(e);
    } finally {
      setRefining(false);
    }
  }

  async function onSend() {
    if (!draft || !recipient || !user?.email) {
      if (!recipient) toast.error("Please enter a recipient email address.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject: subject || "Email draft",
          text: draft.replace(/^Subject: .+\n/i, "").trim(),
          from: user.email,
        }),
      });
      if (!res.ok) throw new Error("Send failed");
      toast.success("Email sent successfully");
      setDraft(null);
    } catch (e) {
      toast.error("Failed to send email. Check your Resend setup.");
    } finally {
      setSending(false);
    }
  }

  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  }

  // Keyboard shortcut: Cmd+Enter to compose / refine
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
  }, [subject, context, tone, audience, recipient, draft, refineText]);

  // Scroll to result when draft appears
  useEffect(() => {
    if (draft && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [draft]);

  const tones = ["formal", "informal", "persuasive"] as const;
  const audiences = ["client", "manager", "team"] as const;

  function pillClass(active: boolean) {
    return active
      ? "bg-accent text-accent-foreground shadow-sm"
      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50";
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
            {/* Minimal header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-2 sm:gap-0">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Mail className="size-4" />
                </span>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">New email</h1>
                  <p className="text-xs text-muted-foreground">Compose with AI assistance</p>
                </div>
              </div>
            </div>

            {/* Recipient field */}
            <div className="flex items-start gap-3 mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest min-w-[48px] pt-2.5">
                To
              </span>
              <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                {recipient && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 border border-accent/20 px-2 py-1 text-sm text-foreground">
                    <span className="size-3.5 rounded-full bg-accent/30 text-[8px] flex items-center justify-center text-accent font-semibold">
                      {recipient[0]?.toUpperCase()}
                    </span>
                    {recipient}
                    <button
                      type="button"
                      onClick={() => setRecipient("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                <input
                  type="text"
                  placeholder={recipient ? "Add another" : "recipient@company.com"}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/40 py-1.5"
                />
              </div>
            </div>

            {/* Subject field */}
            <div className="flex items-start gap-3 mb-5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest min-w-[48px] pt-2.5">
                Subject
              </span>
              <input
                type="text"
                placeholder="What's this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/40 py-1.5"
              />
            </div>

            {/* Separator */}
            <div className="h-px bg-border/50 mb-5" />

            {/* Tone & Audience pills */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Tone group */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mr-1">
                  Tone
                </span>
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${pillClass(tone === t)}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-border/50" />
              {/* Audience group */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mr-1">
                  For
                </span>
                {audiences.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAudience(a)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${pillClass(audience === a)}`}
                  >
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Context textarea */}
            <div className="mb-5">
              <textarea
                placeholder="Add context, key points, or background details..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-vertical focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            {/* Compose button + shortcut hint */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button
                onClick={onGenerate}
                disabled={loading || refining}
                className="rounded-xl px-5 w-full sm:w-auto"
              >
                {loading ? (
                  <><Loader2 className="size-4 animate-spin" /> Drafting...</>
                ) : (
                  <><Sparkles className="size-4" /> Compose</>
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
            {loading && !draft && (
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

            {/* Draft result */}
            {draft && (
              <div ref={resultRef} className="mt-10">
                <div className="flex items-start gap-3">
                  {/* AI indicator */}
                  <div className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="size-2 rounded-full bg-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* AI header bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0">
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
                        {recipient && isAuthenticated && user?.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSend}
                            disabled={sending}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            {sending ? (
                              <><Loader2 className="size-3.5 animate-spin" /> Sending...</>
                            ) : (
                              <><Send className="size-3.5" /> Send</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Draft content */}
                    <div className="rounded-xl bg-card/30 border border-border/50 px-5 py-4">
                      <div className="prose-flow prose-sm max-w-none">
                        <MarkdownView>{draft}</MarkdownView>
                      </div>
                    </div>

                    {/* Refine input */}
                    <div className="mt-3 flex items-center gap-2 bg-card/30 border border-border/50 rounded-xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
                      <input
                        ref={refineInputRef}
                        type="text"
                        placeholder="Tell Operiq how to improve this draft..."
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

                    {/* Disclaimer */}
                    <div className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] text-muted-foreground/60">
                      <ShieldCheck className="size-3 mt-0.5 shrink-0" />
                      <p>AI-generated draft. Review for accuracy, tone, and potential bias before sending or acting on it.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subtle empty hint */}
            {!draft && !loading && (
              <div className="mt-16 text-center">
                <div className="size-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="size-4 text-accent/60" />
                </div>
                <p className="text-sm text-muted-foreground/50">
                  Fill in the details above and click Compose
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}