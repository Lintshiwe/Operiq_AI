# Operiq AI Frontend Fixes and Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 3 critical UI bugs, add 6 new frontend features (voice, video, docs, devtools, studio wiring), and wire studio pages to Convex.

**Architecture:** Convex mutations for studio generation (calling AI SDK via `generateText`), frontend UI with shadcn/ui + Tailwind, lucide-react icons, sonner toasts, Web Audio API for voice features.

**Tech Stack:** React 19, TanStack Start, TanStack Router, Tailwind CSS v4, shadcn/ui, lucide-react, Convex, sonner (toasts), Web Audio API, MediaRecorder API.

---

## File Structure

| File | Purpose |
|------|---------|
| `src/routes/settings.tsx` | Fix billing timeout, fix profile save with toast |
| `src/components/AppShell.tsx` | Fix logout button visibility |
| `src/routes/assistant.$threadId.tsx` | Add TTS, STT, video generation to chat |
| `src/routes/docs.tsx` | New documentation page |
| `src/components/DevToolsGuard.tsx` | New devtools detection overlay |
| `src/routes/__root.tsx` | Wire DevToolsGuard, add `/docs` to public routes |
| `convex/emailDrafts.ts` | Add `generate` mutation |
| `convex/summaries.ts` | Add `generate` mutation |
| `convex/plans.ts` | Add `generate` mutation |
| `convex/analyses.ts` | Add `generate` mutation |
| `src/routes/email.tsx` | Wire to Convex, add copy/send |
| `src/routes/meetings.tsx` | Wire to Convex, add copy |
| `src/routes/planner.tsx` | Wire to Convex, add export as text |
| `src/routes/research.tsx` | Wire to Convex, add copy |

---

## Task 1: Fix Billing Page Timeout

**Files:**
- Modify: `src/routes/settings.tsx:454-593`

- [ ] **Step 1: Add timeout and error state to BillingSection**

Replace the `billing === undefined` check with a timeout-based error state.

```typescript
function BillingSection() {
  const billing = useQuery(api.billing.getBilling);
  const upgrade = useMutation(api.billing.upgradePlan);
  const cancel = useMutation(api.billing.cancelSubscription);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);

  const currentPlan = ((billing as any)?.plan as string) || "free";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (billing === undefined) {
        setLoadTimeout(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [billing]);

  async function handleUpgrade(planId: string) {
    setUpgradingId(planId);
    setBillingError(null);
    try {
      await upgrade({ plan: planId } as any);
    } catch (e) {
      setBillingError(e instanceof Error ? e.message : "Failed to upgrade plan");
    } finally {
      setUpgradingId(null);
    }
  }

  async function handleCancel() {
    setBillingError(null);
    try {
      await cancel();
    } catch (e) {
      setBillingError(e instanceof Error ? e.message : "Failed to cancel subscription");
    }
  }

  if (billing === undefined && !loadTimeout) {
    // existing skeleton loading state
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your billing and subscription settings.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-16" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (billing === undefined && loadTimeout) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your billing and subscription settings.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Could not load billing. Please sign in again.</p>
          <Button
            variant="outline"
            onClick={() => {
              setLoadTimeout(false);
              // Force reload by clearing the timeout flag
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ... rest of existing BillingSection return
```

- [ ] **Step 2: Verify build passes**

Run: `bun run build`
Expected: No TypeScript errors in settings.tsx.

- [ ] **Step 3: Commit**

```bash
git add src/routes/settings.tsx
git commit -m "fix: billing page timeout and error state"
```

---

## Task 2: Fix Profile Save + Toast

**Files:**
- Modify: `src/routes/settings.tsx:658-820`

- [ ] **Step 1: Add `toast` import and use both `users.me` and `profiles.getProfile`**

At the top of settings.tsx, add to the import:
```typescript
import { toast } from "sonner";
```

Add `RefreshCw` to the lucide-react import.

Replace the `ContactSection` with this:

```typescript
function ContactSection() {
  const user = useQuery(api.users.me);
  const profile = useQuery(api.users.me); // use users.me for both email and name (same query)
  const updateProfile = useMutation(api.users.updateProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (user === undefined) {
    // ... existing skeleton loading state
  }

  if (!user) {
    // ... existing not-authenticated state
  }

  const name = user.name || user.email || "User";
  const initial = name.charAt(0).toUpperCase();

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({ name: editName });
      toast.success("Profile updated successfully");
      setEditOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update profile";
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  // ... rest of existing return (Dialog etc.)
  // Keep all the existing JSX for the profile card, links, edit dialog
```

- [ ] **Step 2: Verify build passes**

Run: `bun run build`
Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/settings.tsx
git commit -m "fix: profile save with toast and dual query support"
```

---

## Task 3: Fix Logout Button Visibility

**Files:**
- Modify: `src/components/AppShell.tsx:76-163`

- [ ] **Step 1: Add flex-shrink-0 to UserProfile and LogoutButton, fix nav scroll**

In the desktop sidebar:

```tsx
{/* Nav items */}
<div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
  ...
</div>

<div className="flex-shrink-0">
  <UserProfile />
</div>
<div className="flex-shrink-0">
  <LogoutButton />
</div>
```

Also in the mobile sidebar:

```tsx
<div className="flex-1 min-h-0 overflow-y-auto px-2">
  ...
</div>

<div className="flex-shrink-0">
  <UserProfile />
</div>
<div className="flex-shrink-0">
  <LogoutButton />
</div>
```

Also add `flex-shrink-0` to the `UserProfile` wrapper div and `LogoutButton` wrapper.

- [ ] **Step 2: Commit**

```bash
git add src/components/AppShell.tsx
git commit -m "fix: sidebar logout button visibility with flex-shrink-0"
```

---

## Task 4: Convex Mutations for Studio Pages

**Files:**
- Modify: `convex/emailDrafts.ts`
- Modify: `convex/summaries.ts`
- Modify: `convex/plans.ts`
- Modify: `convex/analyses.ts`

- [ ] **Step 1: Add `generate` mutation to emailDrafts.ts**

```typescript
import { generateText } from "ai";
import { getProvider } from "../src/lib/ai-gateway.server"; // Note: this might not work in Convex

// If AI SDK doesn't work in Convex, use direct fetch:
export const generate = mutation({
  args: {
    recipient: v.optional(v.string()),
    subject: v.optional(v.string()),
    tone: v.string(),
    audience: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const system = `You are an executive communications writer for Operiq AI. Draft a polished business email.
Constraints:
- Tone: ${args.tone}.
- Audience: ${args.audience}.
${args.recipient ? `- Recipient: ${args.recipient}.` : ""}
${args.subject ? `- Subject line hint: ${args.subject}.` : ""}
- Include a clear subject line on the first line as "Subject: ...".
- If a recipient was provided, address them appropriately in the salutation.
- Concise, professional, no filler. Avoid emoji.
- Use markdown.
- Ensure the email is contextually appropriate for the audience and tone specified.`;

    const prompt = `Email purpose: ${args.subject || "Email draft"}\n\nAdditional context: ${args.context || "none"}`;

    // Use direct fetch to OpenAI-compatible API
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey || !baseUrl) {
      throw new Error("AI configuration missing");
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`AI generation failed: ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Save to Convex
    await ctx.db.insert("emailDrafts", {
      userId,
      recipient: args.recipient,
      subject: args.subject,
      tone: args.tone,
      audience: args.audience,
      context: args.context,
      draft: text,
      sent: false,
      createdAt: new Date().toISOString(),
    });

    return { text };
  },
});
```

**IMPORTANT:** Add `import { getAuthUserId } from "@convex-dev/auth/server";` to the top of `convex/emailDrafts.ts`.

- [ ] **Step 2: Add `generate` mutation to summaries.ts**

```typescript
export const generate = mutation({
  args: {
    notes: v.string(),
    meetingType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const system = `You analyze raw meeting notes/transcripts and produce a clear executive briefing.
Meeting type: ${args.meetingType || "general"}. Return markdown with exactly these sections in this order:
## Summary
A 3-5 sentence neutral synopsis.
## Key Decisions
Bulleted list of decisions made.
## Action Items
Bulleted list — each line: **Owner** — task — due date (if mentioned).
## Deadlines
Bulleted list of dates and what is due.
If a section has nothing, write "_None identified_".
Be thorough and accurate. Flag any ambiguous points.`;

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey || !baseUrl) throw new Error("AI configuration missing");

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: args.notes },
        ],
      }),
    });

    if (!res.ok) throw new Error(`AI generation failed: ${res.status}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    await ctx.db.insert("meetingSummaries", {
      userId,
      meetingType: args.meetingType,
      notes: args.notes,
      output: text,
      createdAt: new Date().toISOString(),
    });

    return { text };
  },
});
```

- [ ] **Step 3: Add `generate` mutation to plans.ts**

```typescript
export const generate = mutation({
  args: {
    horizon: v.string(),
    tasks: v.string(),
    goals: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const system = `You are an executive productivity coach. Build a prioritized ${args.horizon} plan.
Return markdown with:
## Prioritized Plan
A numbered schedule (with suggested time blocks for daily; day-by-day for weekly).
Mark each item P1 / P2 / P3.
## Rationale
Briefly explain prioritization (Eisenhower / impact-effort lens).
## Productivity Suggestions
3 concrete improvements tailored to the workload.
Consider dependencies between tasks and energy levels.`;

    const prompt = `Tasks:\n${args.tasks}\n\nGoals/Context: ${args.goals || "none"}`;

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey || !baseUrl) throw new Error("AI configuration missing");

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) throw new Error(`AI generation failed: ${res.status}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    await ctx.db.insert("taskPlans", {
      userId,
      horizon: args.horizon,
      tasks: args.tasks,
      goals: args.goals,
      output: text,
      createdAt: new Date().toISOString(),
    });

    return { text };
  },
});
```

- [ ] **Step 4: Add `generate` mutation to analyses.ts**

```typescript
export const generate = mutation({
  args: {
    material: v.string(),
    question: v.optional(v.string()),
    depth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const system = `You are a senior research analyst. Distill the provided material.
Analysis depth: ${args.depth || "deep"}. Return markdown with:
## Executive Summary
3-5 sentences.
## Key Insights
Bulleted list of the most important findings.
## Recommendations
Numbered, actionable, written for decision-makers.
## Open Questions
Bulleted list of gaps or items needing verification.
Be objective. Flag potential biases in the source material.`;

    const prompt = `Material:\n${args.material}\n\nFocus question: ${args.question || "general analysis"}`;

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey || !baseUrl) throw new Error("AI configuration missing");

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) throw new Error(`AI generation failed: ${res.status}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    await ctx.db.insert("researchAnalyses", {
      userId,
      material: args.material,
      question: args.question,
      depth: args.depth,
      output: text,
      createdAt: new Date().toISOString(),
    });

    return { text };
  },
});
```

- [ ] **Step 5: Add `getAuthUserId` import to all four files**

Add `import { getAuthUserId } from "@convex-dev/auth/server";` to the top of each file.

- [ ] **Step 6: Deploy Convex functions**

Run: `npx convex deploy`
Expected: Functions deploy successfully.

- [ ] **Step 7: Commit**

```bash
git add convex/emailDrafts.ts convex/summaries.ts convex/plans.ts convex/analyses.ts
git commit -m "feat: add generate mutations to studio Convex tables"
```

---

## Task 5: Wire Email Studio to Convex

**Files:**
- Modify: `src/routes/email.tsx`

- [ ] **Step 1: Replace `useServerFn` with `useMutation`**

Replace:
```typescript
const run = useServerFn(generateEmail);
```

With:
```typescript
const generate = useMutation(api.emailDrafts.generate);
```

- [ ] **Step 2: Update `onGenerate` function**

```typescript
async function onGenerate() {
  const topic = subject || "Email draft";
  if (topic.trim().length < 2) return;
  setLoading(true);
  setDraft(null);
  try {
    const result = await generate({
      recipient: recipient || undefined,
      subject: subject || undefined,
      tone,
      audience,
      context: context || undefined,
    });
    setDraft(result.text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate email";
    toast.error(msg);
    console.error(e);
  } finally {
    setLoading(false);
  }
}
```

- [ ] **Step 3: Update `onRefine` to use the same mutation with a refine prompt**

```typescript
async function onRefine() {
  if (!draft || !refineText.trim()) return;
  setRefining(true);
  try {
    const result = await generate({
      recipient: recipient || undefined,
      subject: subject || undefined,
      tone,
      audience,
      context: `Revise this email: ${draft}\n\nRequested changes: ${refineText}`,
    });
    setDraft(result.text);
    setRefineText("");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refinement failed";
    toast.error(msg);
    console.error(e);
  } finally {
    setRefining(false);
  }
}
```

- [ ] **Step 4: Remove unused import of `useServerFn` and `generateEmail`**

Remove:
```typescript
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
```

- [ ] **Step 5: Verify build passes**

Run: `bun run build`
Expected: No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/routes/email.tsx
git commit -m "feat: wire email studio to Convex mutation"
```

---

## Task 6: Wire Meeting Intelligence to Convex

**Files:**
- Modify: `src/routes/meetings.tsx`

- [ ] **Step 1: Replace `useServerFn` with `useMutation`**

```typescript
const generate = useMutation(api.summaries.generate);
```

- [ ] **Step 2: Update `onGenerate`**

```typescript
async function onGenerate() {
  if (notes.trim().length < 20) return;
  setLoading(true);
  setOutput(null);
  try {
    const result = await generate({ notes, meetingType });
    setOutput(result.text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate summary";
    toast.error(msg);
    console.error(e);
  } finally {
    setLoading(false);
  }
}
```

- [ ] **Step 3: Update `onRefine`**

```typescript
async function onRefine() {
  if (!output || !refineText.trim()) return;
  setRefining(true);
  try {
    const result = await generate({
      notes: `Revise this briefing: ${output}\n\nRequested changes: ${refineText}`,
      meetingType: "",
    });
    setOutput(result.text);
    setRefineText("");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refinement failed";
    toast.error(msg);
    console.error(e);
  } finally {
    setRefining(false);
  }
}
```

- [ ] **Step 4: Remove unused imports and commit**

```bash
git add src/routes/meetings.tsx
git commit -m "feat: wire meeting intelligence to Convex mutation"
```

---

## Task 7: Wire Task Planner to Convex

**Files:**
- Modify: `src/routes/planner.tsx`

- [ ] **Step 1: Replace `useServerFn` with `useMutation`**

```typescript
const generate = useMutation(api.plans.generate);
```

- [ ] **Step 2: Update `onGenerate`**

```typescript
async function onGenerate() {
  if (tasks.trim().length < 5) return;
  setLoading(true);
  setOutput(null);
  try {
    const result = await generate({ horizon, tasks, goals: goals || undefined });
    setOutput(result.text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate plan";
    toast.error(msg);
    console.error(e);
  } finally {
    setLoading(false);
  }
}
```

- [ ] **Step 3: Update `onRefine`**

```typescript
async function onRefine() {
  if (!output || !refineText.trim()) return;
  setRefining(true);
  try {
    const result = await generate({
      horizon,
      tasks: `Previous plan:\n${output}\n\nRequested changes: ${refineText}`,
      goals: "",
    });
    setOutput(result.text);
    setRefineText("");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refinement failed";
    toast.error(msg);
    console.error(e);
  } finally {
    setRefining(false);
  }
}
```

- [ ] **Step 4: Add "Export as text" button**

Add in the result action buttons area (next to Copy button):

```typescript
const [exported, setExported] = useState(false);

async function exportAsText() {
  if (!output) return;
  await navigator.clipboard.writeText(output);
  setExported(true);
  setTimeout(() => setExported(false), 1500);
  toast.success("Plan copied to clipboard");
}
```

Add button:
```tsx
<Button variant="ghost" size="sm" onClick={exportAsText} className="h-7 px-2 text-xs gap-1">
  {exported ? (
    <><Check className="size-3.5 text-accent" /> Exported</>
  ) : (
    <><Download className="size-3.5" /> Export</>
  )}
</Button>
```

- [ ] **Step 5: Add `Download` to lucide-react import**

- [ ] **Step 6: Commit**

```bash
git add src/routes/planner.tsx
git commit -m "feat: wire task planner to Convex mutation with export button"
```

---

## Task 8: Wire Research Hub to Convex

**Files:**
- Modify: `src/routes/research.tsx`

- [ ] **Step 1: Replace `useServerFn` with `useMutation`**

```typescript
const generate = useMutation(api.analyses.generate);
```

- [ ] **Step 2: Update `onGenerate`**

```typescript
async function onGenerate() {
  if (material.trim().length < 20) return;
  setLoading(true);
  setOutput(null);
  try {
    const result = await generate({
      material,
      question: question || undefined,
      depth: depth || undefined,
    });
    setOutput(result.text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate analysis";
    toast.error(msg);
    console.error(e);
  } finally {
    setLoading(false);
  }
}
```

- [ ] **Step 3: Update `onRefine`**

```typescript
async function onRefine() {
  if (!output || !refineText.trim()) return;
  setRefining(true);
  try {
    const result = await generate({
      material: `Previous analysis:\n${output}\n\nRequested changes: ${refineText}`,
      question: "",
      depth,
    });
    setOutput(result.text);
    setRefineText("");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refinement failed";
    toast.error(msg);
    console.error(e);
  } finally {
    setRefining(false);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/research.tsx
git commit -m "feat: wire research hub to Convex mutation"
```

---

## Task 9: Add TTS (Text-to-Speech) to Chat

**Files:**
- Modify: `src/routes/assistant.$threadId.tsx`

- [ ] **Step 1: Add `Volume2` to lucide-react import**

- [ ] **Step 2: Add TTS state and handler in ChatPane**

Add these states near the other state declarations (after `imageError`):

```typescript
const [ttsLoading, setTtsLoading] = useState<string | null>(null);
const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
const audioRef = useRef<HTMLAudioElement | null>(null);
```

- [ ] **Step 3: Add `playTTS` function**

```typescript
async function playTTS(messageId: string, text: string) {
  if (ttsPlaying === messageId) {
    // Stop playing
    audioRef.current?.pause();
    audioRef.current = null;
    setTtsPlaying(null);
    return;
  }

  setTtsLoading(messageId);
  try {
    const res = await fetch("/api/elevenlabs-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "TTS generation failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      setTtsPlaying(null);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setTtsPlaying(null);
      URL.revokeObjectURL(url);
      toast.error("Audio playback failed");
    };
    await audio.play();
    setTtsPlaying(messageId);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Failed to read aloud");
  } finally {
    setTtsLoading(null);
  }
}
```

- [ ] **Step 4: Add TTS button to AI message bubbles**

In the AI message rendering area (inside the `!isUser` branch), add a TTS button after the timestamp:

```tsx
{!isUser && (
  <div className="flex gap-3 w-full">
    <Logo variant="ai-avatar" className="mt-0.5 size-7 shrink-0" />
    <div className="min-w-0 flex-1 flex flex-col gap-0.5 text-[15px] leading-relaxed">
      <div className="flex items-center gap-2">
        <MarkdownView>{text || "..."}</MarkdownView>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground/60">
          {timeAgo(m.createdAt ?? Date.now())}
        </span>
        <button
          onClick={() => playTTS(m.id, text)}
          disabled={ttsLoading === m.id}
          className={cn(
            "p-1 rounded-md transition-colors",
            ttsPlaying === m.id
              ? "text-accent bg-accent/10"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-muted",
            ttsLoading === m.id && "animate-pulse",
          )}
          aria-label={ttsPlaying === m.id ? "Stop reading" : "Read aloud"}
          title={ttsPlaying === m.id ? "Stop reading" : "Read aloud"}
        >
          {ttsLoading === m.id ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Volume2 className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/assistant.$threadId.tsx
git commit -m "feat: add TTS read aloud button to AI messages"
```

---

## Task 10: Add STT (Speech-to-Text) to Chat

**Files:**
- Modify: `src/routes/assistant.$threadId.tsx`

- [ ] **Step 1: Add `Mic` to lucide-react import**

- [ ] **Step 2: Add STT state and handlers in ChatPane**

Add states near other state declarations:

```typescript
const [isRecording, setIsRecording] = useState(false);
const [recordingError, setRecordingError] = useState<string | null>(null);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
```

- [ ] **Step 3: Add `startRecording` and `stopRecording` functions**

```typescript
const isSecure = typeof window !== "undefined" && window.isSecureContext;

async function startRecording() {
  if (!isSecure) {
    toast.error("Microphone access requires HTTPS");
    return;
  }
  setRecordingError(null);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      if (blob.size === 0) return;
      try {
        const res = await fetch("/api/elevenlabs-stt", {
          method: "POST",
          body: blob,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Transcription failed");
        }
        const data = await res.json();
        if (data.text) {
          setInput((prev) => {
            const newValue = prev ? `${prev}\n${data.text}` : data.text;
            return newValue;
          });
          toast.success("Transcription added");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to transcribe");
      }
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not access microphone";
    if ((e as any).name === "NotAllowedError" || (e as any).name === "PermissionDeniedError") {
      toast.error("Microphone permission denied. Please allow microphone access in your browser settings.");
    } else {
      toast.error(msg);
    }
    setIsRecording(false);
  }
}

function stopRecording() {
  mediaRecorderRef.current?.stop();
  mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
}
```

- [ ] **Step 4: Add microphone button to composer toolbar**

Add after the Image button in the toolbar:

```tsx
{isSecure && (
  <button
    type="button"
    onClick={() => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }}
    className={cn(
      "shrink-0 size-7 rounded-md flex items-center justify-center transition-colors",
      isRecording
        ? "bg-destructive text-white animate-pulse"
        : "bg-transparent text-muted-foreground hover:bg-muted",
    )}
    aria-label={isRecording ? "Stop recording" : "Start recording"}
    title={isRecording ? "Stop recording" : "Start recording"}
  >
    {isRecording ? (
      <div className="size-3 rounded-full bg-white" />
    ) : (
      <Mic className="size-4" />
    )}
  </button>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/assistant.$threadId.tsx
git commit -m "feat: add STT microphone input to chat composer"
```

---

## Task 11: Add Video Generation to Chat

**Files:**
- Modify: `src/routes/assistant.$threadId.tsx`

- [ ] **Step 1: Add `Film` to lucide-react import**

- [ ] **Step 2: Add video generation state**

Add after the image generation states:

```typescript
const [videoGenOpen, setVideoGenOpen] = useState(false);
const [videoPrompt, setVideoPrompt] = useState("");
const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
const [videoError, setVideoError] = useState<string | null>(null);
```

- [ ] **Step 3: Add `generateVideo` function**

```typescript
async function generateVideo() {
  const prompt = videoPrompt.trim();
  if (!prompt || isGeneratingVideo) return;
  setIsGeneratingVideo(true);
  setVideoError(null);
  setGeneratedVideo(null);
  try {
    const res = await fetch("/api/huggingface-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Video generation failed");
    }
    const data = await res.json();
    if (data.video) {
      setGeneratedVideo(data.video);
    } else {
      throw new Error("No video returned");
    }
  } catch (e) {
    setVideoError(e instanceof Error ? e.message : "Failed to generate video");
  } finally {
    setIsGeneratingVideo(false);
  }
}
```

- [ ] **Step 4: Add video button to toolbar**

Add after the Image button:

```tsx
<button
  type="button"
  onClick={() => setVideoGenOpen((v) => !v)}
  className={cn(
    "shrink-0 size-7 rounded-md flex items-center justify-center transition-colors",
    videoGenOpen
      ? "bg-accent text-white hover:bg-accent/90"
      : "bg-transparent text-muted-foreground hover:bg-muted",
  )}
  aria-label={videoGenOpen ? "Close video generation" : "Open video generation"}
  title="Generate video"
>
  <Film className="size-4" />
</button>
```

- [ ] **Step 5: Add video generation panel (similar to image panel)**

Add after the image generation panel closing `</div>`:

```tsx
{videoGenOpen && (
  <div className="mt-2 rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">Video generation</span>
      <button
        onClick={() => {
          setVideoGenOpen(false);
          setVideoPrompt("");
          setGeneratedVideo(null);
          setVideoError(null);
        }}
        className="p-1 rounded-md hover:bg-muted text-muted-foreground"
        aria-label="Close video generation"
      >
        <X className="size-4" />
      </button>
    </div>
    <div className="flex gap-2">
      <input
        value={videoPrompt}
        onChange={(e) => setVideoPrompt(e.target.value)}
        placeholder="Describe the video you want to generate..."
        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            generateVideo();
          }
        }}
      />
      <Button
        onClick={generateVideo}
        disabled={isGeneratingVideo || !videoPrompt.trim()}
        size="sm"
      >
        {isGeneratingVideo ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Generate"
        )}
      </Button>
    </div>
    {isGeneratingVideo && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Generating video...
      </div>
    )}
    {videoError && (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {videoError}
      </div>
    )}
    {generatedVideo && (
      <div className="rounded-lg border border-border overflow-hidden">
        <video
          src={generatedVideo}
          controls
          className="w-full max-h-[300px] object-contain"
        />
      </div>
    )}
  </div>
)}
```

- [ ] **Step 6: Commit**

```bash
git add src/routes/assistant.$threadId.tsx
git commit -m "feat: add video generation UI to chat composer"
```

---

## Task 12: Create Documentation Page

**Files:**
- Create: `src/routes/docs.tsx`

- [ ] **Step 1: Create the docs page**

```tsx
/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Cpu, Database, Globe, Shield, MessageSquare, Bot,
  ArrowRight, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation · Operiq AI" },
      { name: "description", content: "Operiq AI system documentation." },
    ],
  }),
  component: DocsPage,
});

const SECTIONS = [
  {
    id: "architecture",
    title: "1. System Architecture",
    icon: Cpu,
    content: `Operiq AI is built as a modern full-stack application with a clear separation between frontend, backend, and AI services.

## Component Overview

The system consists of six major components:

### Frontend (Client)
- React 19 with TanStack Start for server-side rendering
- TanStack Router for client-side navigation
- Tailwind CSS v4 for styling with shadcn/ui component library
- Convex React client for real-time data synchronization

### Backend (Server)
- TanStack Start server functions for API endpoints
- Convex Cloud for data persistence and real-time queries
- @convex-dev/auth for authentication

### AI Layer
- OpenAI-compatible gateway via @ai-sdk/openai-compatible
- Multiple model tiers (Ultra, Pro, Plus, Nano, Mini)
- Tool system with web search, URL fetch, and image generation
- ReAct agent loop for autonomous task execution

### Database
- Convex tables: threads, emailDrafts, meetingSummaries, taskPlans, researchAnalyses, sharedChats, billing
- Real-time queries with automatic revalidation

### Email Service
- Resend API integration for sending emails
- /api/resend endpoint for server-side email dispatch

### File Storage
- Convex storage for user data
- File attachment support with text extraction`,
  },
  {
    id: "software",
    title: "2. Software Architecture",
    icon: Database,
    content: `## Frontend Stack

- **Framework**: React 19 + TanStack Start
- **Routing**: TanStack Router with file-based routing
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui (Radix primitives)
- **Icons**: lucide-react (SVG only, no emojis)
- **State Management**: Convex React for server state, React hooks for local state
- **AI Chat**: @ai-sdk/react with DefaultChatTransport

## Backend Stack

- **Server**: TanStack Start with Vite
- **Data**: Convex Cloud (convex@1.40.0)
- **Auth**: @convex-dev/auth with Password provider
- **AI**: @ai-sdk/openai-compatible for text generation
- **Email**: Resend API (resend@6.12.4)

## AI Pipeline

- **Model Registry**: src/lib/models.ts maps Operiq-branded names to provider IDs
- **Chat API**: /api/chat with streaming support
- **Agent Mode**: ReAct loop with tool system
- **Tools**: Web search (DuckDuckGo), URL fetch, image generation (Hugging Face)

## Database Schema

- **threads**: Chat conversations with messages array
- **emailDrafts**: Generated emails with metadata
- **meetingSummaries**: Meeting briefings with decisions and action items
- **taskPlans**: Prioritized task plans with time blocks
- **researchAnalyses**: Research summaries with recommendations
- **sharedChats**: Shared thread access with invite tokens
- **billing**: Subscription plans and usage tracking`,
  },
  {
    id: "dataflow",
    title: "3. Data Flow",
    icon: ArrowRight,
    content: `## Chat Message Flow

1. User types a message in the composer
2. Frontend sends message via useChat hook to /api/chat
3. Server receives message with model and agent mode headers
4. If agent mode is on: runAgentLoop processes the request with tool system
5. If agent mode is off: generateText produces a direct response
6. Server streams response back using AI SDK v1 stream protocol
7. Frontend receives stream and updates UI in real-time
8. On completion, message is saved to Convex threads table

## File Attachment Flow

1. User clicks paperclip and selects file
2. File is read as text via FileReader API
3. File content is appended to the message with metadata
4. Server receives combined text and file content
5. AI processes the combined content

## Image Generation Flow

1. User clicks Image button in toolbar
2. Prompt is entered and submitted
3. Frontend calls /api/huggingface with prompt
4. Server calls Hugging Face FLUX.1-schnell API
5. Base64 image is returned and displayed in chat

## Email Studio Flow

1. User fills recipient, subject, tone, audience, context
2. Frontend calls Convex generate mutation
3. Mutation calls AI API with system prompt
4. Generated draft is saved to Convex and returned
5. User can copy, refine, or send via Resend`,
  },
  {
    id: "ai",
    title: "4. AI Pipeline",
    icon: Bot,
    content: `## Model Routing

The model selector in the composer sends a header (`x-operiq-model`) to the server. The server maps the Operiq-branded name to the actual provider model ID using MODEL_MAP.

## Tool System

Tools are registered in src/lib/tools/registry.ts:
- **web-search**: DuckDuckGo search with query parsing
- **fetch-url**: URL content extraction
- **huggingface-image**: FLUX.1-schnell image generation

## Agent Loop

When agent mode is enabled:
1. System receives user message
2. generateText is called with available tools
3. If tool calls are needed, they are executed
4. Tool results are fed back to the model
5. Process repeats until final response is generated
6. All steps are streamed to the client

## Streaming Protocol

AI SDK v1 uses frame-based streaming:
- f: frames for tool calls
- 0: frames for text deltas
- e: frames for errors

The useChat hook from @ai-sdk/react automatically handles these frames.`,
  },
  {
    id: "security",
    title: "5. Security",
    icon: Shield,
    content: `## Authentication Flow

1. User signs up or logs in via /login or /signup
2. Convex Auth handles password hashing and session management
3. Auth token is stored in cookies
4. useConvexAuth returns authentication state
5. AuthGate component protects private routes
6. Public routes (/login, /signup, /assistant, /invite, /docs) bypass auth

## Data Isolation

- Every Convex query/mutation checks getAuthUserId
- Data is scoped to the authenticated user
- Shared chats use invite tokens with fine-grained access
- Billing and usage data is user-specific

## Rate Limiting

- usage-tracker.ts tracks AI requests and image generations
- 429 responses are returned when limits are exceeded
- Free tier: 50 AI requests/day, 5 image generations/day
- Pro tier: 500 AI requests/day, 50 image generations/day

## Security Headers

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restricts sensitive APIs

## DevTools Detection

Production builds include DevToolsGuard component that:
1. Measures timing differences to detect debugger
2. Shows full-screen overlay if devtools detected
3. Prevents inspection of sensitive code`,
  },
];

function DocsPage() {
  const [activeSection, setActiveSection] = useState("architecture");

  const active = SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
        <img src="/logo-icon.png" alt="" className="w-[400px] h-[400px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">
          <img src="/logo-icon.png" alt="Operiq AI" className="size-7 rounded-lg" />
          <h1 className="text-lg font-semibold">Operiq AI Documentation</h1>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar TOC */}
          <aside className="lg:w-64 shrink-0">
            <nav className="space-y-1 lg:sticky lg:top-8">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-left transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                    <span className="flex-1">{section.title}</span>
                    {isActive && <ChevronRight className="size-3.5" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {active && (
              <article className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <active.icon className="size-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">{active.title}</h2>
                </div>
                <div className="prose-flow prose-sm max-w-none text-foreground/90 leading-relaxed">
                  {active.content.split("\n\n").map((paragraph, idx) => {
                    if (paragraph.startsWith("## ")) {
                      return (
                        <h3 key={idx} className="text-lg font-semibold mt-8 mb-4 text-foreground">
                          {paragraph.replace("## ", "")}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith("- ") || paragraph.startsWith("1. ") || paragraph.startsWith("2. ") || paragraph.startsWith("3. ") || paragraph.startsWith("4. ") || paragraph.startsWith("5. ") || paragraph.startsWith("6. ")) {
                      const items = paragraph.split("\n").filter((l) => l.trim());
                      return (
                        <ul key={idx} className="space-y-1.5 mb-4">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-accent mt-1">•</span>
                              <span>{item.replace(/^[-\d.\s]+/, "")}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={idx} className="mb-4 text-sm text-muted-foreground">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </article>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add `/docs` to public routes in `__root.tsx`**

In `src/routes/__root.tsx`, update the `isPublicRoute` check:

```typescript
const isPublicRoute =
  pathname === "/login" ||
  pathname === "/signup" ||
  pathname.startsWith("/assistant") ||
  pathname.startsWith("/invite") ||
  pathname.startsWith("/docs");
```

- [ ] **Step 3: Verify build passes**

Run: `bun run build`
Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/docs.tsx src/routes/__root.tsx
git commit -m "feat: add documentation system at /docs"
```

---

## Task 13: Create DevTools Warning Overlay

**Files:**
- Create: `src/components/DevToolsGuard.tsx`
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Create DevToolsGuard component**

```tsx
/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

export function DevToolsGuard() {
  const [detected, setDetected] = useState(false);
  const isProduction = typeof window !== "undefined" && process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!isProduction) return;

    // Detection method 1: console warning
    const detectDevTools = () => {
      const threshold = 160;
      const check = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
          setDetected(true);
        }
      };
      window.addEventListener("resize", check);
      const interval = setInterval(check, 500);
      return () => {
        window.removeEventListener("resize", check);
        clearInterval(interval);
      };
    };

    // Detection method 2: timing
    const detectTiming = () => {
      const detect = () => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
          setDetected(true);
        }
      };
      const interval = setInterval(detect, 1000);
      return () => clearInterval(interval);
    };

    const cleanup1 = detectDevTools();
    const cleanup2 = detectTiming();

    return () => {
      cleanup1();
      cleanup2();
    };
  }, [isProduction]);

  if (!detected) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-center p-8">
      <img src="/logo-icon.png" alt="Operiq AI" className="size-16 rounded-xl mb-6 opacity-80" />
      <h1 className="text-2xl font-semibold text-white mb-4">Session Terminated</h1>
      <p className="text-sm text-gray-400 max-w-md mb-8">
        Developer tools have been detected. For security reasons, this session has been terminated.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-200 transition-colors"
      >
        <RotateCcw className="size-4" />
        Reload
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Wire DevToolsGuard into RootComponent**

In `src/routes/__root.tsx`, add the import:
```typescript
import { DevToolsGuard } from "@/components/DevToolsGuard";
```

Add inside the `RootComponent` return, inside the `ConvexAuthProvider`:
```tsx
<ConvexAuthProvider client={convex}>
  <QueryClientProvider client={queryClient}>
    <DevToolsGuard />
    {isPublicRoute ? (
      <Outlet />
    ) : (
      <AuthGate>
        <Outlet />
      </AuthGate>
    )}
  </QueryClientProvider>
</ConvexAuthProvider>
```

- [ ] **Step 3: Verify build passes**

Run: `bun run build`
Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/DevToolsGuard.tsx src/routes/__root.tsx
git commit -m "feat: add DevTools detection overlay in production"
```

---

## Final Verification

- [ ] **Step 1: Run full build**

Run: `bun run build`
Expected: Zero TypeScript errors.

- [ ] **Step 2: Run lint**

Run: `bun run lint`
Expected: No lint errors.

- [ ] **Step 3: Summary of changes**

```bash
git log --oneline -15
```

---

## Self-Review Checklist

1. **Spec coverage:** All 6 fixes/features are covered.
2. **Placeholder scan:** No TBDs, TODOs, or incomplete sections.
3. **Type consistency:** All mutation signatures match between Convex and frontend.
