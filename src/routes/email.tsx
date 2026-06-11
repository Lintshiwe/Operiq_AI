/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Copy, Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: (search.prefill as string) || "",
  }),
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

const TONE_OPTIONS = [
  { label: "Professional", value: "formal" },
  { label: "Friendly", value: "informal" },
  { label: "Urgent", value: "persuasive" },
] as const;

function EmailPage() {
  const { prefill } = Route.useSearch();
  const generate = useMutation(api.emailDrafts.generate);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState<string>("formal");
  const [context, setContext] = useState(prefill || "");
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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
        tone: tone as "formal" | "informal" | "persuasive",
        audience: "client",
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

  async function handleCopy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  }

  // Keyboard shortcut: Cmd+Enter to generate
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onGenerate();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [subject, context, tone, recipient]);

  return (
    <AppShell>
      <div className="h-full flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-[680px] space-y-8">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-center text-foreground">
            AI Email Generator
          </h1>

          {/* Three fields row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="Recipient Name"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <Input
              placeholder="Email Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wide textarea */}
          <Textarea
            placeholder="Key points or context for the email..."
            rows={6}
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />

          {/* Generate button - centered pill */}
          <div className="flex justify-center">
            <Button
              onClick={onGenerate}
              disabled={loading}
              className="rounded-full px-8 bg-accent/80 hover:bg-accent text-accent-foreground"
            >
              {loading ? (
                <>
                  <Mail className="size-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="size-4 mr-2" />
                  Generate Email
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

          {/* Preview card */}
          {draft && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="text-xs text-muted-foreground">
                From: sender@company.com
              </div>
              <div className="text-xs text-muted-foreground">
                To: {recipient || "recipient@company.com"}
              </div>
              <div className="text-sm font-medium text-foreground">
                Subject: {subject || "Email draft"}
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {draft}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="size-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
