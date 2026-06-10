# Email Studio — Minimalist Production Redesign

## Overview
Redesign the existing Email Studio page from a standard two-column form+output layout to a unique, minimalist composer canvas inspired by modern writing tools (Linear, Notion, Apple Mail). The UX should feel like composing an email in a premium client, with Operiq AI as a collaborative assistant.

## Current State
- Standard two-column layout (form left, output right) — same as all other tool pages
- Tone and audience as separate `<Select>` dropdowns
- No recipient field, no subject field
- Generic markdown output area
- Single "Generate draft" button
- No iteration/refine flow

## Design Direction
- **Not a form** — inputs are styled as an inline composer canvas
- **AI as collaborator** — output appears below as a chat-style card with "Operiq AI" identity
- **Minimal chrome** — no card borders dividing input from output, no separate panels
- **Production details** — keyboard shortcuts, tag pills, inline refine loop

## Layout (top-to-bottom single column, max-width ~680px centered)

```
┌──────────────────────────────────────────┐
│ [O] New email                    [⋮] [—] │
├──────────────────────────────────────────┤
│ To:   [alex@company.com  ✕] + Add        │
│ Subject: [Q2 Budget Proposal — Follow-up] │
│                                          │
│ Tone: [Informal] Formal  Persuasive       │
│ For:  [Client]  Manager  Team            │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Context / key points...              │ │
│ │                                      │ │
│ │ (textarea, dark bg, subtle border)   │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [✦ Compose]  or press ⌘+Enter           │
├──────────────────────────────────────────┤
│  ●  Operiq AI · Just now   [Copy][Refine]│
│                                          │
│  Subject: Q2 Budget Proposal — Follow-up │
│                                          │
│  Hey Alex,                               │
│                                          │
│  Following up on our conversation...     │
│                                          │
│  [Tell Operiq how to refine...     ] [→] │
└──────────────────────────────────────────┘
```

## Components

### Composer Area
- **To field** — email chip input with pill tags (like Apple Mail recipient field)
- **Subject field** — inline text input
- **Tone pills** — 3 pill buttons (Formal/Informal/Persuasive), active one filled green
- **Audience pills** — 3 pill buttons (Client/Manager/Team), active one filled green
- **Context textarea** — dark raised surface, placeholder text, resizable
- **Compose button** — green (#10a37f) with sparkle icon + "Compose" label
- **Keyboard shortcut** — `Cmd+Enter` shown as hint next to button

### Result Area (appears after generation)
- **AI identity bar** — green dot + "Operiq AI" + timestamp, with Copy/Refine actions
- **Email preview** — formatted markdown showing subject line, body text
- **Refine input** — inline text input at bottom of result card, lets user request changes

### States
- **Empty** — compose area visible, no result area
- **Loading** — compose area visible, result area shows skeleton with pulsing bars
- **Result** — compose area collapsed (or still visible above), result card below
- **Refining** — result card shows updated content after refine request
- **Error** — result area shows error message with retry button

## Backend Changes

### Updated `generateEmail` function
- New fields: `recipient` (optional), `subject` (optional)
- Prompt updated to include recipient and subject context
- Response still returns `{ text: string }`

```typescript
const EmailInput = z.object({
  topic: z.string().min(2).max(2000),
  tone: z.enum(["formal", "informal", "persuasive"]),
  audience: z.enum(["client", "manager", "team"]),
  context: z.string().max(2000).optional(),
  recipient: z.string().max(500).optional(),
  subject: z.string().max(500).optional(),
});
```

## Frontend Implementation

### Files to modify
- `src/routes/email.tsx` — complete rewrite of the page component
- `src/lib/ai.functions.ts` — add recipient/subject fields to schema + prompt

### States & State Management
Single `useState` for each field + a `draft` state object:
```typescript
const [recipient, setRecipient] = useState("");
const [subject, setSubject] = useState("");
const [tone, setTone] = useState<"formal" | "informal" | "persuasive">("informal");
const [audience, setAudience] = useState<"client" | "manager" | "team">("client");
const [context, setContext] = useState("");
const [draft, setDraft] = useState<{ text: string; refineCount: number } | null>(null);
const [loading, setLoading] = useState(false);
const [copied, setCopied] = useState(false);
```

### Interactions
- **Pill toggle** — clicking a pill sets that value, others become inactive
- **Compose** — triggers `generateEmail` with all fields; on success, populates draft state
- **Copy** — copies draft text to clipboard, shows checkmark for 1.5s
- **Refine** — sends current draft + refine prompt back to AI (reuse `generateEmail` with topic set to "revise the following email: ${originalDraft}. Requested changes: ${refinePrompt}")
- **Cmd+Enter** — keyboard shortcut to trigger compose
- **Cmd+Shift+Enter** — to trigger refine

## Acceptance Criteria
1. Page looks like the mockup — not a form, a composer canvas
2. Recipient and subject fields are included
3. Tone and audience work as clickable pill tags
4. Compose button triggers AI generation
5. Result appears as a chat-style card below the composer
6. Copy button copies draft text
7. Refine input allows iterating on the draft
8. Cmd+Enter triggers compose
9. Loading state shows skeleton
10. Mobile responsive
