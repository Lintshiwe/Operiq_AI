import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

async function run(system: string, prompt: string) {
  const provider = gateway();
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
      `You are an executive communications writer for FlowDesk AI. Draft a polished business email.
Constraints:
- Tone: ${data.tone}.
- Audience: ${data.audience}.
- Include a clear subject line on the first line as "Subject: ...".
- Concise, professional, no filler. Avoid emoji.
- Use markdown.`,
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
If a section has nothing, write "_None identified_".`,
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
3 concrete improvements tailored to the workload.`,
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
Bulleted list of gaps or items needing verification.`,
      `Material:\n${data.material}\n\nFocus question: ${data.question ?? "general analysis"}`,
    ),
  );
