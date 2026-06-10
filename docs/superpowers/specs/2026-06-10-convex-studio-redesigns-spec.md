# Operiq AI — Convex Infrastructure & Tool Redesigns

## Overview
Integrate Convex as the persistent data layer (replacing localStorage), add password-based auth, redesign the 3 remaining Studio tools (Meeting Intelligence, Task Planner, Research Hub) as Copilot-style single-column composers, and add email sending via Resend.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  React (TanStack Start)                             │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │ Auth UI  │ │ Tools   │ │ ConvexProvider    │   │
│  │(login/   │ │(email,  │ │ (useAuth, useQuery,│   │
│  │ signup)  │ │ meetings│ │  useMutation)     │   │
│  │          │ │ planner,│ │                   │   │
│  │          │ │ research│ │                   │   │
│  └──────────┘ └──────────┘ └───────────────────┘   │
├───────────────┬─────────────────────────────────────┤
│ Server Fns    │  AI gateway (unchanged)             │
│ (TanStack)    │  Resend API (new)                   │
└───────────────┴─────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  Convex Cloud                                        │
│  ┌──────┐ ┌──────────┐ ┌────────────────────────┐  │
│  │Auth  │ │ Schema   │ │ Queries / Mutations    │  │
│  │      │ │ users    │ │ threads.getByUser()     │  │
│  │      │ │ threads  │ │ threads.create()        │  │
│  │      │ │ email    │ │ email_drafts.save()     │  │
│  │      │ │ meetings │ │ summaries.save()        │  │
│  │      │ │ plans    │ │ plans.save()            │  │
│  │      │ │ research │ │ analyses.save()         │  │
│  └──────┘ └──────────┘ └────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Data Schema

### Tables (Convex)

**users** — managed by Convex Auth password-based provider. Automatically stores email and hashed password.

**threads** (migrated from localStorage)
```
{ _id, userId, title, messages: Message[], createdAt, updatedAt }
```

**email_drafts** (history of generated/sent emails)
```
{ _id, userId, recipient, subject, tone, audience, context, draft: string, sent: boolean, sentAt?, createdAt }
```

**summaries** (meeting intelligence history)
```
{ _id, userId, meetingType, notes, output: string, createdAt }
```

**plans** (task planner history)
```
{ _id, userId, horizon, tasks, goals, output: string, createdAt }
```

**analyses** (research hub history)
```
{ _id, userId, material, question, depth, output: string, createdAt }
```

## Authentication (Password-Based)

- Login page at `/login`, signup at `/signup`
- Convex Auth password-based provider
- After auth: redirect to `/assistant`
- Unauthenticated users see login/signup pages
- Auth state managed via `useConvexAuth()` + `useAuthActions()`
- User email from auth is available app-wide for Email Studio sender

## Tool Redesigns (Copilot-Style)

Common pattern for all 3 tools:

### Layout
- Single-column centered canvas (max-w-[680px])
- Minimal inline header (icon + title + subtitle)
- Input fields specific to each tool
- Pill/tag controls for option choices
- **Sparkles button** → AI result card below
- Result card: AI indicator header + Copy action + Refine input loop
- Loading skeleton + subtle empty state
- Cmd+Enter keyboard shortcut
- Inline AI disclaimer

### Meeting Intelligence
- Large textarea: "Paste meeting transcript or rough notes..."
- Pill toggle: Meeting type — *1:1 / Team Sync / Client Call / All-Hands*
- Generate → structured briefing (summary, decisions, action items, deadlines)
- Result card with Copy, refine loop
- Backend: `summarizeMeeting` already accepts `notes` param. Add `meetingType` param.

### Task Planner
- Pill toggle: *Daily / Weekly* horizon (replacing Select dropdown)
- Tasks textarea: "List your tasks (one per line)..."
- Goals textarea: "Goals or context (optional)"
- Generate → prioritized plan with time blocks, P1/P2/P3, rationale
- Result card with Copy, refine loop
- Backend: `planTasks` already accepts `horizon`, `tasks`, `goals`

### Research Hub
- Large textarea: "Paste report, article, or transcript..."
- Input field: "Focus question (optional)"
- Pill toggle: Analysis depth — *Quick Summary / Deep Analysis / Executive Brief*
- Generate → summary, insights, recommendations, open questions
- Result card with Copy, refine loop
- Backend: `analyzeResearch` already accepts `material`, `question`. Add `depth` param.

## Email Sending via Resend

- Add `RESEND_API_KEY` to `.env`
- Create server function `sendEmail`:
  - Takes: `{ to, subject, text, html }`
  - From address: user's auth email
  - Calls Resend API
- Email Studio: Add "Send" button next to "Copy" in result card
- After sending: show success toast, mark draft as `sent: true` in Convex
- History view: show sent vs. draft emails

## Data Migration (localStorage → Convex)

- On first render after auth, check if localStorage has old threads
- If so, batch-import them into Convex via `threads.import()`
- Clear localStorage after successful import
- All new threads go directly to Convex

## Component Tree (New)

```
ConvexClientProvider (root)
├── AuthGate (wraps protected pages)
│   ├── /login → LoginPage
│   ├── /signup → SignupPage
│   └── Protected route
│       ├── /assistant → AssistantThreadPage (uses Convex threads)
│       ├── /code → CodePage
│       ├── /email → EmailPage (+ Resend "Send" button)
│       ├── /meetings → MeetingsPage (redesigned)
│       ├── /planner → PlannerPage (redesigned)
│       └── /research → ResearchPage (redesigned)
```

## Files to Create/Modify

### Create
- `convex/schema.ts` — all table definitions
- `convex/auth.ts` — Convex Auth config
- `convex/auth.config.ts` — auth provider config
- `convex/threads.ts` — threads mutations/queries
- `convex/emailDrafts.ts` — email draft mutations/queries
- `convex/summaries.ts` — meeting summary mutations/queries
- `convex/plans.ts` — task plan mutations/queries
- `convex/analyses.ts` — research analysis mutations/queries
- `convex/README.md` — Convex usage notes
- `src/components/AuthGate.tsx` — auth wrapper component
- `src/routes/login.tsx` — login page
- `src/routes/signup.tsx` — signup page
- `src/routes/api/resend.ts` — Resend server function

### Modify
- `src/routes/__root.tsx` — add ConvexClientProvider
- `src/routes/meetings.tsx` — full redesign
- `src/routes/planner.tsx` — full redesign
- `src/routes/research.tsx` — full redesign
- `src/routes/email.tsx` — add Send button + history
- `src/routes/assistant.$threadId.tsx` — use Convex for threads
- `src/lib/ai.functions.ts` — add meetingType + depth params
- `.env.example` — update with new env vars
- `.env` — add RESEND_API_KEY (user provides value)

## Env Vars Added
```
CONVEX_DEPLOYMENT=next-goldfish-387
CONVEX_URL=https://next-goldfish-387.convex.cloud
CONVEX_DEV_TOKEN=dev:...
RESEND_API_KEY=re_...
```

## Questions / Edge Cases
- What happens when Convex is down? Show a banner, fall back to localStorage reads.
- Thread export? Not needed for MVP. Can add later.
- Email sending rate limits? Resend has 100/day on free plan. Show warning if exceeded.
- Multiple tabs? Convex real-time sync handles this naturally.
