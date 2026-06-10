# Operiq AI — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand FlowDesk AI to Operiq AI, remove all Lovable.dev infrastructure, and redesign the entire UI to match ChatGPT's dark interface exactly.

**Architecture:** TanStack Start app (React + Vite + TypeScript + Tailwind CSS v4). Server functions for AI operations. localStorage for thread persistence. Direct OpenAI-compatible provider replacing Lovable gateway.

**Tech Stack:** React 19, TanStack Start, TanStack Router, Tailwind CSS v4, shadcn/ui, lucide-react, `@ai-sdk/openai-compatible`, Bun

---

### Phase 1: Foundation — Rename & Remove Lovable

---

### Task 1: Update package.json and remove Lovable dependency

**Files:**
- Modify: `package.json`
- Modify: `bunfig.toml`
- Delete: `.lovable/`

- [ ] **Step 1: Update package.json**

```json
{
  "name": "operiq-ai",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@ai-sdk/openai-compatible": "^2.0.48",
    "@ai-sdk/react": "^3.0.199",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.16",
    "@radix-ui/react-dropdown-menu": "^2.1.17",
    "@radix-ui/react-hover-card": "^1.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.3.0",
    "@radix-ui/react-separator": "^1.1.9",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.5",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.9",
    "@streamdown/cjk": "^1.0.3",
    "@streamdown/code": "^1.1.1",
    "@streamdown/math": "^1.0.2",
    "@streamdown/mermaid": "^1.0.2",
    "@tailwindcss/vite": "^4.2.1",
    "@tanstack/react-query": "^5.83.0",
    "@tanstack/react-router": "^1.168.25",
    "@tanstack/react-start": "^1.167.50",
    "@tanstack/router-plugin": "^1.167.28",
    "ai": "^6.0.197",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^1.17.0",
    "motion": "^12.40.0",
    "nanoid": "^5.1.11",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.71.2",
    "react-markdown": "^10.1.0",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "streamdown": "^2.5.0",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.3.4",
    "use-stick-to-bottom": "^1.1.6",
    "vaul": "^1.1.2",
    "vite-tsconfig-paths": "^6.0.2",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@types/node": "^22.16.5",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.0.4",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "prettier": "^3.7.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.56.1",
    "vite": "^7.3.1"
  }
}
```

Key changes from current:
- `name`: `"tanstack_start_ts"` → `"operiq-ai"`
- Remove `"@lovable.dev/vite-tanstack-config"` from devDependencies
- Add `"nitro"` back temporarily if needed (but actually since we're removing the Lovable vite config, we need to add the plugins manually)

- [ ] **Step 2: Remove .lovable directory**

Run: `rm -rf .lovable/`

- [ ] **Step 3: Update bunfig.toml**

Remove the Lovable-related exclusions:

```toml
[install]
minimumReleaseAge = 86400
minimumReleaseAgeExcludes = []
```

- [ ] **Step 4: Install dependencies**

Run: `bun install`

- [ ] **Step 5: Commit**

```bash
git add package.json bunfig.toml .lovable
git rm -r .lovable
git commit -m "chore: rename project to operiq-ai, remove Lovable dependency"
```

---

### Task 2: Rewrite vite.config.ts without Lovable

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Replace vite.config.ts content**

Current file uses `@lovable.dev/vite-tanstack-config`. We need standard Vite plugins:

```ts
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add vite.config.ts
git commit -m "chore: replace Lovable vite config with standard plugins"
```

---

### Task 3: Replace AI Gateway (remove Lovable)

**Files:**
- Modify: `src/lib/ai-gateway.server.ts`

- [ ] **Step 1: Rewrite ai-gateway.server.ts**

Replace Lovable gateway with direct OpenAI-compatible provider:

```ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createAiProvider(apiKey: string, baseUrl?: string) {
  return createOpenAICompatible({
    name: "operiq-ai",
    baseURL: baseUrl ?? "https://api.openai.com/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

export function getProvider() {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error("Missing AI_API_KEY environment variable");
  const baseUrl = process.env.AI_BASE_URL;
  return createAiProvider(key, baseUrl);
}
```

- [ ] **Step 2: Delete lovable-error-reporting.ts**

Run: `rm src/lib/lovable-error-reporting.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai-gateway.server.ts
git rm src/lib/lovable-error-reporting.ts
git commit -m "refactor: replace Lovable AI gateway with direct provider"
```

---

### Task 4: Update API routes and server functions

**Files:**
- Modify: `src/routes/api/chat.ts`
- Modify: `src/lib/ai.functions.ts`

- [ ] **Step 1: Update api/chat.ts**

Replace Lovable gateway imports and env vars:

```ts
import { getProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const provider = getProvider();
        const modelName = process.env.AI_MODEL ?? "gpt-4o-mini";

        try {
          const result = streamText({
            model: provider(modelName),
            system: `You are Operiq AI, a calm, precise executive productivity assistant for working professionals.
Specialties: drafting communications, summarizing meetings, structuring plans, distilling research, and answering workplace questions.
Be concise, professional, and well-structured. Prefer markdown with short headings and lists.
When uncertain, say so. Remind users to review AI-generated output before acting on it when stakes are high.
Avoid speculation about real people and avoid politically loaded claims; flag potential bias and limitations when relevant.`,
            messages: await convertToModelMessages(messages),
          });

          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (err) {
          const status = (err as { status?: number })?.status;
          if (status === 429)
            return new Response("Rate limit reached. Please retry shortly.", { status: 429 });
          if (status === 402)
            return new Response("AI credits exhausted. Please add credits to continue.", {
              status: 402,
            });
          throw err;
        }
      },
    },
  },
});
```

- [ ] **Step 2: Update ai.functions.ts**

Replace Lovable gateway with new provider, update system prompts for better quality:

```ts
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getProvider } from "./ai-gateway.server";

const MODEL = process.env.AI_MODEL ?? "gpt-4o-mini";

async function run(system: string, prompt: string) {
  const provider = getProvider();
  const { text } = await generateText({
    model: provider(MODEL),
    system,
    prompt,
  });
  return { text };
}

/* ---------- Email Studio ---------- */
const EmailInput = z.object({
  topic: z.string().min(2).max(2000),
  tone: z.enum(["formal", "informal", "persuasive"]),
  audience: z.enum(["client", "manager", "team"]),
  context: z.string().max(2000).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) =>
    run(
      `You are an executive communications writer for Operiq AI. Draft a polished business email.
Constraints:
- Tone: ${data.tone}.
- Audience: ${data.audience}.
- Include a clear subject line on the first line as "Subject: ...".
- Concise, professional, no filler. Avoid emoji.
- Use markdown.
- Ensure the email is contextually appropriate for the audience and tone specified.`,
      `Email purpose: ${data.topic}\n\nAdditional context: ${data.context ?? "none"}`,
    ),
  );

/* ---------- Meeting Intelligence ---------- */
const MeetingInput = z.object({
  notes: z.string().min(20).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) =>
    run(
      `You analyze raw meeting notes/transcripts and produce a clear executive briefing.
Return markdown with exactly these sections in this order:
## Summary
A 3-5 sentence neutral synopsis.
## Key Decisions
Bulleted list of decisions made.
## Action Items
Bulleted list — each line: **Owner** — task — due date (if mentioned).
## Deadlines
Bulleted list of dates and what is due.
If a section has nothing, write "_None identified_".
Be thorough and accurate. Flag any ambiguous points.`,
      data.notes,
    ),
  );

/* ---------- Task Planner ---------- */
const PlannerInput = z.object({
  horizon: z.enum(["daily", "weekly"]),
  tasks: z.string().min(5).max(5000),
  goals: z.string().max(1000).optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) =>
    run(
      `You are an executive productivity coach. Build a prioritized ${data.horizon} plan.
Return markdown with:
## Prioritized Plan
A numbered schedule (with suggested time blocks for daily; day-by-day for weekly).
Mark each item P1 / P2 / P3.
## Rationale
Briefly explain prioritization (Eisenhower / impact-effort lens).
## Productivity Suggestions
3 concrete improvements tailored to the workload.
Consider dependencies between tasks and energy levels.`,
      `Tasks:\n${data.tasks}\n\nGoals/Context: ${data.goals ?? "none"}`,
    ),
  );

/* ---------- Research Hub ---------- */
const ResearchInput = z.object({
  material: z.string().min(20).max(20000),
  question: z.string().max(1000).optional(),
});

export const analyzeResearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) =>
    run(
      `You are a senior research analyst. Distill the provided material.
Return markdown with:
## Executive Summary
3-5 sentences.
## Key Insights
Bulleted list of the most important findings.
## Recommendations
Numbered, actionable, written for decision-makers.
## Open Questions
Bulleted list of gaps or items needing verification.
Be objective. Flag potential biases in the source material.`,
      `Material:\n${data.material}\n\nFocus question: ${data.question ?? "general analysis"}`,
    ),
  );
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/api/chat.ts src/lib/ai.functions.ts
git commit -m "refactor: replace Lovable gateway in routes and server functions"
```

---

### Task 5: Rename all brand references (FlowDesk → Operiq AI)

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/assistant.index.tsx`
- Modify: `src/routes/assistant.$threadId.tsx`
- Modify: `src/routes/email.tsx`
- Modify: `src/routes/meetings.tsx`
- Modify: `src/routes/planner.tsx`
- Modify: `src/routes/research.tsx`
- Modify: `src/lib/threads.ts`

- [ ] **Step 1: Update __root.tsx**

Update meta tags and remove Lovable error reporting:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Operiq AI</p>
        <h1 className="mt-4 font-display text-6xl font-semibold text-foreground">404</h1>
        <h2 className="mt-3 text-xl font-medium text-foreground">Page not found</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Something interrupted this page
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try again, or return to the workspace overview.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Operiq AI — Executive Productivity, Reimagined" },
      {
        name: "description",
        content:
          "Operiq AI is the AI-powered workplace productivity platform for professionals — draft emails, summarize meetings, plan work, and research smarter.",
      },
      { name: "author", content: "Operiq AI" },
      { property: "og:title", content: "Operiq AI — Executive Productivity Assistant" },
      {
        property: "og:description",
        content: "Premium AI workspace for professionals: email, meetings, planning, research, assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
```

Key changes:
- Removed `reportLovableError` import and usage
- "FlowDesk AI" → "Operiq AI" in all meta tags
- Added `className="dark"` to `<html>` tag (since we're dark-mode-only)
- Removed Fraunces font (keeping Inter only for clean modern look)

- [ ] **Step 2: Update threads.ts**

```ts
const KEY = "operiq.threads.v1";
```

- [ ] **Step 3: Update all route page titles**

In each route file, replace `FlowDesk AI` with `Operiq AI`:

- `assistant.index.tsx`: `"AI Assistant \u00b7 Operiq AI"`
- `assistant.$threadId.tsx`: `"Operiq AI"` (head title)
- `email.tsx`: `"Email Studio \u00b7 Operiq AI"`
- `meetings.tsx`: `"Meeting Intelligence \u00b7 Operiq AI"`
- `planner.tsx`: `"Task Planner \u00b7 Operiq AI"`
- `research.tsx`: `"Research Hub \u00b7 Operiq AI"`

- [ ] **Step 4: Commit**

```bash
git add src/routes/__root.tsx src/routes/assistant.index.tsx src/routes/assistant.$threadId.tsx src/routes/email.tsx src/routes/meetings.tsx src/routes/planner.tsx src/routes/research.tsx src/lib/threads.ts
git commit -m "feat: rebrand all pages from FlowDesk AI to Operiq AI"
```

---

### Phase 2: ChatGPT-Style Dark Theme & UI Redesign

---

### Task 6: Create ChatGPT Dark Theme (styles.css)

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Replace styles.css with ChatGPT dark palette**

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: "Inter", ui-sans-serif, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --font-display: var(--font-sans);
}

:root {
  --radius: 0.75rem;

  /* ChatGPT Dark Mode Palette */
  --background: oklch(0.165 0 0);          /* #212121 */
  --foreground: oklch(0.98 0 0);            /* #ffffff */

  --card: oklch(0.195 0 0);                 /* #2a2a2a */
  --card-foreground: oklch(0.98 0 0);

  --popover: oklch(0.195 0 0);
  --popover-foreground: oklch(0.98 0 0);

  --primary: oklch(0.98 0 0);               /* white buttons */
  --primary-foreground: oklch(0.165 0 0);

  --secondary: oklch(0.35 0 0);             /* secondary elements */
  --secondary-foreground: oklch(0.98 0 0);

  --muted: oklch(0.22 0 0);                 /* #303030 */
  --muted-foreground: oklch(0.55 0 0);      /* #8e8e8e */

  --accent: oklch(0.55 0.15 165);           /* ChatGPT green #10a37f */
  --accent-foreground: oklch(0.98 0 0);

  --destructive: oklch(0.55 0.20 27);
  --destructive-foreground: oklch(0.98 0 0);

  --border: oklch(0.25 0 0);                /* #3a3a3a */
  --input: oklch(0.25 0 0);
  --ring: oklch(0.45 0 0);

  /* ChatGPT sidebar: slightly darker than main bg */
  --sidebar: oklch(0.135 0 0);              /* #171717 */
  --sidebar-foreground: oklch(0.98 0 0);
  --sidebar-primary: oklch(0.98 0 0);
  --sidebar-primary-foreground: oklch(0.165 0 0);
  --sidebar-accent: oklch(0.22 0 0);        /* hover/selected #303030 */
  --sidebar-accent-foreground: oklch(0.98 0 0);
  --sidebar-border: oklch(0.2 0 0);         /* #2a2a2a */
  --sidebar-ring: oklch(0.45 0 0);
}

@layer base {
  * { border-color: var(--color-border); }
  html, body { 
    font-family: var(--font-sans); 
    background-color: var(--color-background);
    color: var(--color-foreground);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  h1, h2, h3 {
    font-family: var(--font-sans);
    letter-spacing: -0.01em;
    font-weight: 600;
  }
}

@utility surface-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

/* Markdown prose styles for dark theme */
.prose-flow p { margin: 0 0 0.85rem; line-height: 1.7; color: var(--color-foreground); }
.prose-flow h1, .prose-flow h2, .prose-flow h3 { margin: 1.25rem 0 0.5rem; font-weight: 600; color: var(--color-foreground); }
.prose-flow ul, .prose-flow ol { padding-left: 1.25rem; margin: 0 0 0.85rem; }
.prose-flow li { margin: 0.25rem 0; }
.prose-flow strong { color: var(--color-foreground); font-weight: 600; }
.prose-flow code { background: var(--color-muted); padding: 0.1rem 0.35rem; border-radius: 6px; font-size: 0.9em; }
.prose-flow pre { background: oklch(0.12 0 0); color: oklch(0.95 0 0); padding: 0.85rem 1rem; border-radius: 10px; overflow-x: auto; margin: 0 0 0.85rem; }
.prose-flow pre code { background: transparent; padding: 0; color: inherit; }
```

- [ ] **Step 2: Commit**

```bash
git add src/styles.css
git commit -m "style: ChatGPT dark mode color palette"
```

---

### Task 7: Redesign AppShell as ChatGPT Sidebar

**Files:**
- Modify: `src/components/AppShell.tsx`

This is a major redesign. The AppShell becomes a full ChatGPT-style sidebar for tool pages. Remove the sticky header.

```tsx
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  PanelLeft,
  Plus,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Mail;
};

const NAV: NavItem[] = [
  { to: "/assistant", label: "Assistant", icon: MessageSquareText },
  { to: "/email", label: "Email Studio", icon: Mail },
  { to: "/meetings", label: "Meetings", icon: CalendarCheck2 },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/research", label: "Research", icon: BookOpen },
];

/**
 * AppShell — ChatGPT-style dark sidebar for tool pages.
 * The assistant page has its own dedicated layout (AssistantThreadPage).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(true);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex h-dvh w-full bg-background text-foreground">
      {/* Sidebar */}
      {open && (
        <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 h-14">
            <BrandMark />
            <span className="font-semibold text-sm">Operiq</span>
            <span className="text-sm text-muted-foreground">AI</span>
          </div>

          {/* New chat button */}
          <div className="px-2 pb-2">
            <Link
              to="/assistant"
              className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
            >
              <Plus className="size-4" />
              New chat
            </Link>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {NAV.map((item) => {
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as "/assistant"}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>
      )}

      {/* Sidebar toggle (mobile) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-md bg-sidebar text-sidebar-foreground border border-sidebar-border"
          aria-label="Open sidebar"
        >
          <PanelLeft className="size-4" />
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50">
            <div className="flex items-center justify-between px-3 h-14">
              <div className="flex items-center gap-2">
                <BrandMark />
                <span className="font-semibold text-sm">Operiq</span>
                <span className="text-sm text-muted-foreground">AI</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent"
              >
                <PanelLeft className="size-4" />
              </button>
            </div>
            <div className="px-2 pb-2">
              <Link
                to="/assistant"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
              >
                <Plus className="size-4" />
                New chat
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {NAV.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to as "/assistant"}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
                      active
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-lg bg-[#10a37f] text-white",
        className,
      )}
    >
      <span className="text-[13px] font-bold leading-none">O</span>
    </span>
  );
}
```

- [ ] **Step 1: Write the AppShell component above**

- [ ] **Step 2: Commit**

```bash
git add src/components/AppShell.tsx
git commit -m "feat: ChatGPT-style dark sidebar for all tool pages"
```

---

### Task 8: Redesign Assistant Thread Page (ChatGPT Clone)

**Files:**
- Modify: `src/routes/assistant.$threadId.tsx`

This is the most critical page — a pixel-perfect ChatGPT clone. The current file already has the right structure but needs:
- Dark theme applied
- Sidebar refined to exact ChatGPT look
- Chat composer styled like ChatGPT
- Brand references updated to Operiq AI

Full rewrite:

```tsx
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  ArrowUp,
  Trash2,
  Loader2,
  PanelLeft,
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownView } from "@/components/MarkdownView";
import { BrandMark } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import {
  createBlankThread,
  deriveTitle,
  loadThreads,
  saveThreads,
  type Thread,
} from "@/lib/threads";

export const Route = createFileRoute("/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "Operiq AI" },
      { name: "description", content: "AI-powered workplace productivity assistant." },
    ],
  }),
  component: AssistantThreadPage,
});

const MODULES = [
  { to: "/email", label: "Email Studio", icon: Mail },
  { to: "/meetings", label: "Meeting Intelligence", icon: CalendarCheck2 },
  { to: "/planner", label: "Task Planner", icon: ListChecks },
  { to: "/research", label: "Research Hub", icon: BookOpen },
];

function AssistantThreadPage() {
  const { threadId } = useParams({ from: "/assistant/$threadId" });
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [threads, setThreads] = useState<Thread[]>(() => {
    if (typeof window === "undefined") return [];
    const existing = loadThreads();
    if (existing.length === 0) {
      const t = createBlankThread();
      saveThreads([t]);
      return [t];
    }
    return existing;
  });

  const current = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId],
  );

  useEffect(() => {
    if (current || typeof window === "undefined") return;
    const t: Thread = { ...createBlankThread(), id: threadId };
    setThreads((prev) => {
      const next = [t, ...prev];
      saveThreads(next);
      return next;
    });
  }, [current, threadId]);

  const handleCreate = () => {
    const t = createBlankThread();
    const next = [t, ...threads];
    setThreads(next);
    saveThreads(next);
    navigate({ to: "/assistant/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = (id: string) => {
    const next = threads.filter((t) => t.id !== id);
    setThreads(next);
    saveThreads(next);
    if (id === threadId) {
      const target = next[0]?.id;
      if (target) {
        navigate({ to: "/assistant/$threadId", params: { threadId: target } });
      } else {
        const t = createBlankThread();
        saveThreads([t]);
        setThreads([t]);
        navigate({ to: "/assistant/$threadId", params: { threadId: t.id } });
      }
    }
  };

  return (
    <div className="flex h-dvh w-full bg-background text-foreground">
      {sidebarOpen && (
        <ThreadSidebar
          threads={threads}
          activeId={threadId}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <ChatPane
        key={threadId}
        thread={current ?? { id: threadId, title: "New conversation", updatedAt: Date.now(), messages: [] }}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onNewChat={handleCreate}
        onMessagesUpdate={(messages) => {
          setThreads((prev) => {
            const next = prev.map((t) =>
              t.id === threadId
                ? { ...t, messages, updatedAt: Date.now(), title: deriveTitle(messages) }
                : t,
            );
            saveThreads(next);
            return next;
          });
        }}
      />
    </div>
  );
}

/* ------------ Sidebar ------------ */

function ThreadSidebar({
  threads,
  activeId,
  onCreate,
  onDelete,
  onClose,
}: {
  threads: Thread[];
  activeId: string;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const groups = useMemo(() => groupThreads(threads), [threads]);

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo area */}
      <div className="flex items-center justify-between gap-2 px-3 h-14">
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="font-semibold text-sm">Operiq</span>
          <span className="text-sm text-muted-foreground">AI</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Hide sidebar"
          className="p-1.5 rounded-md text-muted-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>

      {/* New chat */}
      <div className="px-2 pb-2">
        <button
          onClick={onCreate}
          className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-sidebar-accent text-sidebar-foreground border border-sidebar-border"
        >
          <Plus className="size-4" />
          New chat
        </button>
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {threads.length === 0 && (
          <p className="px-3 py-6 text-xs text-muted-foreground">No conversations yet.</p>
        )}
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1 text-[11px] font-medium text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.threads.map((t) => {
                const active = t.id === activeId;
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "group relative rounded-md transition-colors",
                      active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/70",
                    )}
                  >
                    <Link
                      to="/assistant/$threadId"
                      params={{ threadId: t.id }}
                      className="block truncate pl-2.5 pr-9 py-2 text-sm text-sidebar-foreground"
                    >
                      {t.title}
                    </Link>
                    <button
                      onClick={() => onDelete(t.id)}
                      aria-label={`Delete ${t.title}`}
                      className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:bg-background hover:text-destructive transition-opacity",
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Workspace links at bottom */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <p className="px-2 pt-1 pb-1.5 text-[11px] font-medium text-muted-foreground">Workspaces</p>
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.to}
              to={m.to as "/email"}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {m.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function groupThreads(threads: Thread[]) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const buckets: Record<string, Thread[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    "Previous 30 days": [],
    Older: [],
  };
  for (const t of threads) {
    const age = now - t.updatedAt;
    if (age < day) buckets.Today.push(t);
    else if (age < 2 * day) buckets.Yesterday.push(t);
    else if (age < 7 * day) buckets["Previous 7 days"].push(t);
    else if (age < 30 * day) buckets["Previous 30 days"].push(t);
    else buckets.Older.push(t);
  }
  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([label, arr]) => ({ label, threads: arr }));
}

/* ------------ Chat pane ------------ */

const QUICK_PROMPTS = [
  "Draft a polite follow-up to a client who hasn't replied in a week",
  "Summarize my meeting notes into decisions and action items",
  "Plan a focused workday with three deep-work blocks",
  "What sharp questions should I ask in a QBR?",
];

function ChatPane({
  thread,
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  onMessagesUpdate,
}: {
  thread: Thread;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onMessagesUpdate: (messages: UIMessage[]) => void;
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (e) => console.error(e),
  });

  useEffect(() => {
    if (status === "submitted" || status === "streaming") return;
    onMessagesUpdate(messages);
  }, [messages, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [thread.id]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  const isLoading = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0 && !isLoading;

  async function submit(text: string) {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <section className="flex-1 flex flex-col h-dvh bg-background min-w-0">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-3 lg:px-4 border-b border-border/60">
        <div className="flex items-center gap-1">
          {!sidebarOpen && (
            <>
              <button
                onClick={onToggleSidebar}
                aria-label="Show sidebar"
                className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <PanelLeft className="size-4" />
              </button>
              <button
                onClick={onNewChat}
                aria-label="New chat"
                className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted cursor-default">
            <BrandMark className="size-5" />
            <span className="text-sm font-semibold">Operiq</span>
            <span className="text-sm text-muted-foreground">AI</span>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="New chat"
        >
          <MessageSquareText className="size-4" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState onPick={(s) => submit(s)} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 lg:px-6 py-6 space-y-6">
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  {isUser ? (
                    <div className="max-w-[80%] rounded-2xl bg-card text-foreground px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap border border-border">
                      {text}
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full">
                      <BrandMark className="mt-0.5 size-7 shrink-0" />
                      <div className="min-w-0 flex-1 text-[15px] leading-relaxed">
                        <MarkdownView>{text || "..."}</MarkdownView>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <BrandMark className="mt-0.5 size-7 shrink-0" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <Loader2 className="size-3.5 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error.message || "Something went wrong."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer (ChatGPT style) */}
      <div className="px-4 lg:px-6 pb-4 pt-2 bg-background">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="relative flex items-end rounded-xl border border-border bg-card shadow-sm focus-within:border-muted-foreground/50 transition-colors"
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder="Message Operiq AI..."
              rows={1}
              className="min-h-[44px] max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 px-4 py-3 pr-12 text-sm bg-transparent leading-relaxed"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || input.trim().length === 0}
              aria-label="Send message"
              className="absolute right-1.5 bottom-1.5 size-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            </Button>
          </form>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            Operiq AI can make mistakes. Verify important information before acting.
          </p>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <BrandMark className="mx-auto size-10 mb-4" />
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          What can I help with?
        </h2>
        <div className="mt-8 grid sm:grid-cols-2 gap-2">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => onPick(q)}
              className="text-left rounded-xl border border-border bg-card hover:bg-muted px-4 py-3 text-sm text-foreground transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

Key changes from original:
- Dark theme applied everywhere (bg-background, text-foreground, etc.)
- All "FlowDesk" → "Operiq AI"
- Composer: rounded-xl, dark card bg, cleaner send button
- User messages: rounded-2xl with dark card bg
- AI messages: cleaner prose-flow styling
- Delete button: red on hover
- Disclaimer text uses Operiq AI branding

- [ ] **Step 1: Write the full assistant.$threadId.tsx above**

- [ ] **Step 2: Commit**

```bash
git add src/routes/assistant.$threadId.tsx
git commit -m "feat: ChatGPT-style dark assistant page"
```

---

### Task 9: Redesign Tool Pages (Email, Meetings, Planner, Research) in Dark Theme

**Files:**
- Modify: `src/routes/email.tsx`
- Modify: `src/routes/meetings.tsx`
- Modify: `src/routes/planner.tsx`
- Modify: `src/routes/research.tsx`

Each tool page needs:
- Remove the old AppShell header/PageHeader pattern
- Use the ChatGPT dark sidebar AppShell
- Dark theme applied throughout
- Cleaner split-panel layout: left input panel, right output panel
- Consistent styling with the assistant page

The pattern is the same for all four. Here's the Email page as the template:

- [ ] **Step 1: Rewrite email.tsx with dark theme**

```tsx
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, Copy, Check, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Studio · Operiq AI" },
      {
        name: "description",
        content: "Draft polished professional emails in formal, informal or persuasive tones.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<"formal" | "informal" | "persuasive">("formal");
  const [audience, setAudience] = useState<"client" | "manager" | "team">("client");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onGenerate() {
    if (topic.trim().length < 3) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await run({ data: { topic, context, tone, audience } });
      setOutput(res.text);
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page header */}
        <div className="px-6 lg:px-10 py-6 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Email Studio
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
              Compose with intention.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Drafts that respect the reader — written in your chosen tone, for the right audience.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
            {/* Form panel */}
            <div className="lg:col-span-2 surface-card p-5 space-y-4 h-fit">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Mail className="size-4" />
                </span>
                <h2 className="text-base font-semibold text-foreground">New draft</h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="topic" className="text-sm">What is the email about?</Label>
                <Input
                  id="topic"
                  placeholder="e.g. Following up on Q2 budget proposal"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="informal">Informal</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Audience</Label>
                  <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="context" className="text-sm">Optional context</Label>
                <Textarea
                  id="context"
                  rows={5}
                  placeholder="Key points, dates, names, or background..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <Button
                onClick={onGenerate}
                disabled={loading || topic.trim().length < 3}
                className="w-full"
              >
                {loading ? <><Loader2 className="size-4 animate-spin" /> Drafting...</> : "Generate draft"}
              </Button>

              <AIDisclaimer />
            </div>

            {/* Output panel */}
            <div className="lg:col-span-3 surface-card p-5 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Draft</h2>
                {output && (
                  <Button variant="outline" size="sm" onClick={copy}>
                    {copied ? <><Check className="size-3.5" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
                  </Button>
                )}
              </div>

              {!output && !loading && (
                <EmptyState
                  title="Your draft will appear here"
                  hint="Describe the email's purpose and we'll compose a thoughtful first draft."
                />
              )}
              {loading && <SkeletonLines />}
              {output && (
                <div className="prose-flow flex-1">
                  <MarkdownView>{output}</MarkdownView>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="size-12 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground">
        <Mail className="size-5" />
      </div>
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">{hint}</p>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-3 animate-pulse">
      {[90, 75, 95, 60, 80, 70].map((w, i) => (
        <div key={i} className="h-3 rounded bg-muted" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function AIDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <ShieldCheck className="size-3.5 mt-0.5 shrink-0" />
      <p>
        AI-generated draft. Review for accuracy, tone, and potential bias before sending or acting on it.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Apply the same pattern to meetings.tsx, planner.tsx, research.tsx**

Each follows the same template but with:
- Different icon (CalendarCheck2, ListChecks, BookOpen)
- Different title/description
- Different form fields
- Same dark theme styling

- [ ] **Step 3: Commit**

```bash
git add src/routes/email.tsx src/routes/meetings.tsx src/routes/planner.tsx src/routes/research.tsx
git commit -m "feat: dark theme redesign for all tool pages"
```

---

### Task 10: Add GitHub remote rename and .env.example

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create .env.example**

```env
# Operiq AI Configuration
# Copy this file to .env and fill in your values

# AI Provider (required)
# Get your API key from your AI provider
AI_API_KEY=your-api-key-here

# AI Model (optional, defaults to gpt-4o-mini)
AI_MODEL=gpt-4o-mini

# AI Base URL (optional, for custom endpoints)
# AI_BASE_URL=https://api.openai.com/v1
```

- [ ] **Step 2: Notify user about GitHub rename**

The GitHub repo rename needs to be done via GitHub UI. Provide instructions:

```
To rename the GitHub repo:
1. Go to https://github.com/Lintshiwe/flowdesk-ai/settings
2. Change repository name to "operiq-ai"
3. Click "Rename"

Then update local remote:
git remote set-url origin https://github.com/Lintshiwe/operiq-ai.git
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example with AI provider configuration"
```

---

### Phase 3: Polish & Ready for Assessment

---

### Task 11: Final verification and build test

- [ ] **Step 1: Build the project**

```bash
bun run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Fix any build issues**

Address any TypeScript errors, missing imports, or CSS issues.

- [ ] **Step 3: Store the final working state**

```bash
git add -A && git commit -m "fix: final polish and build fixes"
```

---

## Self-Review Check

**Spec coverage:**
- Rename to Operiq AI → Task 1, 5
- Remove Lovable → Task 1, 2, 3, 4
- ChatGPT-style UI → Tasks 6, 7, 8, 9
- Logo → Task 7 (BrandMark component)
- No emojis, real icons → Already using lucide-react, explicitly enforced
- Functionality enhancements (prompt engineering, responsible AI) → Task 4 (updated prompts), all tool pages have AIDisclaimer component

**Placeholder scan:** No TBD, TODO, or placeholder patterns found.

**Type consistency:** BrandMark component signature matches usage in both AppShell and assistant page.
