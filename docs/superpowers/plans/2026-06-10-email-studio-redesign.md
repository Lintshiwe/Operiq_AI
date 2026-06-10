# Email Studio Minimalist Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Email Studio page from a generic two-column form to a unique minimalist composer canvas with AI assistant interaction.

**Architecture:** Single-page redesign. Backend `generateEmail` function gets `recipient` and `subject` fields added to its schema/prompt. Frontend `email.tsx` is fully rewritten with a single-column canvas layout: inline To/Subject inputs, clickable tone/audience pill tags, context textarea, compose button with Cmd+Enter shortcut, and result appearing as a chat-style card below with copy/refine actions.

**Tech Stack:** React 19, TanStack Start, Tailwind CSS v4, lucide-react, ai-sdk, @tanstack/react-start (useServerFn)

---
### Task 1: Update backend generateEmail schema and prompt

**Files:**
- Modify: `src/lib/ai.functions.ts:17-39`
- Test: N/A (server functions tested via e2e)

- [ ] **Step 1: Add recipient and subject fields to EmailInput schema**

```typescript
// Replace the existing EmailInput schema (lines 18-23):
const EmailInput = z.object({
  topic: z.string().min(2).max(2000),
  tone: z.enum(["formal", "informal", "persuasive"]),
  audience: z.enum(["client", "manager", "team"]),
  context: z.string().max(2000).optional(),
  recipient: z.string().max(500).optional(),
  subject: z.string().max(500).optional(),
});
```

- [ ] **Step 2: Update generateEmail prompt to include recipient and subject**

```typescript
// Replace the prompt template in the handler (lines 28-38):
`You are an executive communications writer for Operiq AI. Draft a polished business email.
Constraints:
- Tone: ${data.tone}.
- Audience: ${data.audience}.
${data.recipient ? `- Recipient: ${data.recipient}.` : ""}
${data.subject ? `- Subject line hint: ${data.subject}.` : ""}
- Include a clear subject line on the first line as "Subject: ...".
- If a recipient was provided, address them appropriately in the salutation.
- Concise, professional, no filler. Avoid emoji.
- Use markdown.
- Ensure the email is contextually appropriate for the audience and tone specified.`,
`Email purpose: ${data.topic}\n\nAdditional context: ${data.context ?? "none"}`,
```

- [ ] **Step 3: Commit backend changes**

```bash
git add src/lib/ai.functions.ts
git commit -m "feat(email): add recipient & subject fields to generateEmail"
```

---
### Task 2: Rewrite email.tsx — composer canvas with AI assistant

**Files:**
- Modify: `src/routes/email.tsx` (full rewrite)

This is the big one. The entire page gets rewritten with the new minimalist design.

- [ ] **Step 1: Write the email page shell — imports, state, and Route definition**

```typescript
import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Mail, Loader2, Copy, Check, ShieldCheck,
  Sparkles, X, SendHorizontal
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { generateEmail } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Studio · Operiq AI" },
      {
        name: "description",
        content: "Compose polished professional emails with AI assistance.",
      },
    ],
  }),
  component: EmailPage,
});
```

- [ ] **Step 2: Write the EmailPage component with all state**

```typescript
function EmailPage() {
  const run = useServerFn(generateEmail);
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
  const composeRef = useRef<HTMLButtonElement>(null);
  const refineInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function onGenerate() {
    const topic = subject || "Email draft";
    if (topic.trim().length < 2) return;
    setLoading(true);
    setDraft(null);
    try {
      const res = await run({ data: { topic, context, tone, audience, recipient, subject } });
      setDraft(res.text);
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
      const res = await run({
        data: {
          topic: `Revise this email: ${draft}\n\nRequested changes: ${refineText}`,
          context: "",
          tone,
          audience,
          recipient,
          subject,
        },
      });
      setDraft(res.text);
      setRefineText("");
    } catch (e) {
      toast.error("Refinement failed. Please try again.");
      console.error(e);
    } finally {
      setRefining(false);
    }
  }

  async function copy() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Keyboard shortcut: Cmd+Enter to compose
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (refineInputRef.current === document.activeElement) {
          onRefine();
        } else {
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

  const pills = ["formal", "informal", "persuasive"] as const;
  const audiencePills = ["client", "manager", "team"] as const;
```

- [ ] **Step 3: Write the composer panel (the top half — canvas inputs)**

```tsx
return (
  <AppShell>
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-6 py-8 lg:py-10">
          {/* Minimal header */}
          <div className="flex items-center justify-between mb-8">
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
                  <button onClick={() => setRecipient("")} className="text-muted-foreground hover:text-foreground">
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
              {pills.map((p) => (
                <button
                  key={p}
                  onClick={() => setTone(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    tone === p
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-border/50" />
            {/* Audience group */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mr-1">
                For
              </span>
              {audiencePills.map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    audience === a
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
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
          <div className="flex items-center gap-3">
            <Button
              ref={composeRef}
              onClick={onGenerate}
              disabled={loading || refining}
              className="rounded-xl px-5"
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Drafting...</>
              ) : (
                <><Sparkles className="size-4" /> Compose</>
              )}
            </Button>
            <span className="text-xs text-muted-foreground/50">
              or press <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[11px] font-mono text-muted-foreground">⌘Enter</kbd>
            </span>
          </div>
```

- [ ] **Step 4: Write the result card and refine loop**

```tsx
          {/* Result area */}
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

          {draft && (
            <div ref={resultRef} className="mt-10">
              <div className="flex items-start gap-3">
                {/* AI indicator */}
                <div className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="size-2 rounded-full bg-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* AI header bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">Operiq AI</span>
                      <span className="text-[10px] text-muted-foreground/50">·</span>
                      <span className="text-[11px] text-muted-foreground/50">Just now</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={copy} className="h-7 px-2 text-xs gap-1">
                        {copied ? <><Check className="size-3.5 text-accent" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
                      </Button>
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
                      onClick={onRefine}
                      disabled={refining || !refineText.trim()}
                      className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-30"
                    >
                      {refining ? <Loader2 className="size-3.5 animate-spin" /> : <SendHorizontal className="size-3.5" />}
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

          {/* Empty state (composer is always visible, but if no draft and not loading, show subtle hint) */}
          {!draft && !loading && (
            <div className="mt-10 text-center">
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
```

- [ ] **Step 5: Commit the email.tsx rewrite**

```bash
git add src/routes/email.tsx
git commit -m "feat(email): redesign as minimalist composer canvas with AI assistant"
```

---
### Task 3: Verify build compiles cleanly

- [ ] **Step 1: Build the project**

Run: `bun run build`
Expected: SSR and client builds succeed, exit code 0, no errors

- [ ] **Step 2: Start dev server and test the email page**

```bash
bun run dev --host &
sleep 6
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/email
```
Expected: 200

- [ ] **Step 3: Test AI generation through the page**

```bash
curl -s -X POST "http://localhost:3000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Test email generation","parts":[{"type":"text","text":"Test email generation"}]}]}' \
  --max-time 30 | head -20
```
Expected: streaming SSE response (data: {...})

---
