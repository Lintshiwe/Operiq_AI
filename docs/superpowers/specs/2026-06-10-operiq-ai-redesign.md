# Operiq AI — ChatGPT-Style Redesign & Lovable Migration

## Overview

Rebrand the existing FlowDesk AI (TanStack Start app) to **Operiq AI**, remove all Lovable.dev infrastructure, and redesign the entire UI to match the ChatGPT (chat.openai.com) interface exactly.

## Brand

- **Name:** Operiq AI
- **Logo:** Custom "O" icon (rounded square, green `#10a37f` accent fill, white letter) + "Operiq AI" wordmark
- **Style:** Minimal, monochrome, dark-first, ChatGPT-inspired
- **Icons:** lucide-react throughout (no emojis)

## Scope

### 1. Rename: FlowDesk → Operiq AI (everywhere)

**Files to update (non-exhaustive):**
- `package.json` — name, description
- `src/routes/__root.tsx` — all meta tags (title, description, OG)
- `src/routes/assistant.index.tsx` — page title
- `src/routes/assistant.$threadId.tsx` — page title, header labels, chat placeholder text
- `src/routes/email.tsx` — page title
- `src/routes/meetings.tsx` — page title
- `src/routes/planner.tsx` — page title
- `src/routes/research.tsx` — page title
- `src/components/AppShell.tsx` — brand references
- `src/lib/threads.ts` — localStorage key
- `src/routes/api/chat.ts` — system prompt
- `src/lib/ai.functions.ts` — system prompts

### 2. Remove Lovable Infrastructure

**Delete:**
- `.lovable/` directory
- `src/lib/lovable-error-reporting.ts`

**Modify:**
- `vite.config.ts` — replace `@lovable.dev/vite-tanstack-config` with standard Vite plugins (TanStack Start, React, Tailwind, tsconfig-paths)
- `package.json` — remove `@lovable.dev/vite-tanstack-config` devDependency
- `bunfig.toml` — remove lovable package exclusions
- `src/lib/ai-gateway.server.ts` — replace Lovable AI Gateway with direct OpenAI-compatible provider (configurable API key)
- `src/routes/api/chat.ts` — update to use new gateway, update env var names
- `src/lib/ai.functions.ts` — update to use new gateway
- `src/routes/__root.tsx` — remove lovable-error-reporting import and usage

### 3. ChatGPT-Style UI Redesign

**Color Palette (Dark Mode):**
```
--background: #212121
--sidebar: #171717
--card: #2a2a2a
--border: #3a3a3a
--accent: #10a37f (ChatGPT green)
--foreground: #ffffff
--muted-foreground: #8e8e8e
```

**Layout System:**

| Component | Description |
|-----------|-------------|
| Sidebar | 260px wide, `#171717` bg, thread list grouped by date, new-chat button, bottom workspace links |
| Chat area | Centered messages (max-width 768px), user messages right-aligned, AI messages left-aligned with logo avatar |
| Composer | Fixed bottom, rounded `#2a2a2a` input with border `#3a3a3a`, send button, auto-grow |
| Tool pages (Email/Meetings/Planner/Research) | Same sidebar, main area becomes left input panel + right output panel in dark theme |

**Key UI elements:**
- Empty state: centered logo + "What can I help with?" heading
- Thread sidebar: title auto-derived from first user message, grouped by Today/Yesterday/Previous 7 days/Older
- Delete button: visible on hover of thread items (red on hover)
- Quick prompts: 2x2 grid below empty state heading
- Bottom disclaimer: "Operiq AI can make mistakes. Verify important information."
- Full dark theme applied to ALL pages, not just assistant

### 4. Functionality Enhancements (from PDF requirements)

- **Prompt engineering improvement:** Refine all system prompts across email, meetings, planner, research for better accuracy (25% evaluation weight)
- **Responsible AI:** Ensure disclaimers, bias warnings, and validation messages are present on all AI output pages (10% evaluation weight)
- **Loading states:** Consistent skeleton/shimmer across all pages
- **Error handling:** Clear error messages with retry options

## Architecture

- **App shell:** Assistant page uses a dedicated ChatGPT-style layout (sidebar + chat). Tool pages use the same sidebar but swap main content.
- **Routing:** `/` redirects to `/assistant`. Tool pages at `/email`, `/meetings`, `/planner`, `/research` keep sidebar consistent.
- **State:** Threads stored in localStorage, grouped and sorted by timestamp.
- **AI Provider:** Direct OpenAI-compatible provider (configurable via env var), replacing Lovable gateway.
- **Server:** TanStack Start server functions for AI operations.

## Roadmap (Implementation Order)

1. **Phase 1 — Foundation:** Remove Lovable + rename all references → operational app under new name
2. **Phase 2 — Dark Theme:** Update styles.css with ChatGPT color palette
3. **Phase 3 — Sidebar:** Redesign thread sidebar to exact ChatGPT spec
4. **Phase 4 — Chat Area:** Redesign chat pane, composer, empty state
5. **Phase 5 — Tool Pages:** Apply dark theme + ChatGPT layout to Email/Meetings/Planner/Research
6. **Phase 6 — Polish:** Logo, prompt refinement, disclaimers, loading states
7. **Phase 7 — Verify:** Build, test, fix

## Out of Scope

- No marketing/landing homepage (app routes directly to assistant)
- No authentication system
- No database (localStorage only for threads)
- No mobile-native app (responsive web only)
