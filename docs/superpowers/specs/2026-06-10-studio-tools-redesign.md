# Studio Tool Redesign — Design Spec

## Date: 2026-06-10

## Overview
Redesign 3 Studio tool pages (Meeting Intelligence, Task Planner, Research Hub) to match the Copilot-style single-column composer pattern established by Email Studio (`src/routes/email.tsx`).

## Design Pattern (from email.tsx)

Each page follows this exact single-column composer structure:

1. **Layout**: `<AppShell>` → `flex-1 flex flex-col overflow-hidden` → scrollable area → centered `max-w-[680px]` column
2. **Header**: icon + title + subtitle (minimal, not the old 2-column page header)
3. **Input area**: single column, inline fields and textareas
4. **Option pills**: pill toggle buttons for option choices (like tone/audience in email)
5. **Generate button**: `Sparkles` icon + text + `Cmd+Enter` shortcut hint
6. **Loading skeleton**: animated pulse with `bg-muted/40` bars
7. **Result card**: AI indicator (green dot in accent box) + "Operiq AI · Just now" header + Copy button
8. **Refine input bar**: text input + `SendHorizontal` button (Cmd+Enter to refine)
9. **Disclaimer**: `ShieldCheck` icon + AI-generated warning
10. **Empty state**: subtle hint with icon when no input entered yet
11. **Smooth scroll** to result on generation
12. **Keyboard**: `useEffect` with `keydown` listener checking `e.metaKey || e.ctrlKey`
13. **modKey**: `useState` for `⌘`/`Ctrl`, set via `useEffect(() => setModKey(navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"), [])`
14. **All imports inline**: no external EmptyState/SkeletonLines/PageHeader/AIDisclaimer components
15. **AIDisclaimer defined locally** at bottom of file

## Page Specifications

### Task 12 — Meeting Intelligence (`src/routes/meetings.tsx`)
- **Icon**: `CalendarCheck2`
- **Header**: "Meeting Intelligence" / "Summarize meetings — extract decisions, action items and deadlines"
- **Pill toggle**: "1:1" / "Team Sync" / "Client Call" / "All-Hands" (state: `meetingType`)
- **Textarea**: "Paste meeting transcript or rough notes..." (rows ~12)
- **Generate button**: `<Sparkles className="size-4" /> Generate briefing`
- **Result section**: "Briefing"
- **Calls**: `useServerFn(summarizeMeeting)` with data: `{ notes, meetingType }`
- **Refine**: calls `summarizeMeeting` with `notes` set to `Revise this briefing: ${output}\n\nRequested changes: ${refineText}` and empty `meetingType`

### Task 13 — Task Planner (`src/routes/planner.tsx`)
- **Icon**: `ListChecks`
- **Header**: "Task Planner" / "Generate prioritized daily and weekly plans"
- **Pill toggle**: "Daily" / "Weekly" (replacing current Select dropdown)
- **Textarea 1**: "List your tasks (one per line)..." (rows ~8)
- **Textarea 2**: "Goals or context (optional)" (rows ~3)
- **Generate button**: `<Sparkles className="size-4" /> Generate plan`
- **Result section**: "Plan"
- **Calls**: `useServerFn(planTasks)` with data: `{ horizon, tasks, goals }`
- **Refine**: calls `planTasks` with `tasks` set to previous output + refine request

### Task 14 — Research Hub (`src/routes/research.tsx`)
- **Icon**: `BookOpen`
- **Header**: "Research Hub" / "Summarize research, surface insights, and generate recommendations"
- **Pill toggle**: "Quick Summary" / "Deep Analysis" / "Executive Brief" (state: `depth`)
- **Textarea**: "Paste report, article, or transcript..." (rows ~10)
- **Input field**: "Focus question (optional)" (single line)
- **Generate button**: `<Sparkles className="size-4" /> Generate analysis`
- **Result section**: "Analysis"
- **Calls**: `useServerFn(analyzeResearch)` with data: `{ material, question, depth }`
- **Refine**: calls `analyzeResearch` with `material` set to previous output + refine request

## Tech Notes
- React 19 + TanStack Start + Tailwind CSS v4 + lucide-react
- Dark theme: `bg-[#212121]` (background), `bg-[#171717]` (sidebar), `#10a37f` (accent)
- NO emojis — professional SVG icons only
- All component code inline in each route file (no external imports beyond shadcn/ui, AppShell, MarkdownView)

## Backend
- Do NOT modify `src/lib/ai.functions.ts`
- Backend schemas already updated by another agent to include `meetingType` and `depth` parameters
