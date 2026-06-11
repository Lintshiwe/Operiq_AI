/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { getProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { toolsToAISDK } from "@/lib/tools/index";
import { AGENT_SYSTEM_EXTENSION } from "@/lib/agent-loop";
import { checkUsageLimit, trackAiUsage } from "@/lib/usage-tracker";

const SYSTEM_PROMPT = `You are Operiq AI, a calm, precise executive productivity assistant for working professionals.
Specialties: drafting communications, summarizing meetings, structuring plans, distilling research, and answering workplace questions.
Be concise, professional, and well-structured. Prefer markdown with short headings and lists.
When uncertain, say so. Remind users to review AI-generated output before acting on it when stakes are high.
Avoid speculation about real people and avoid politically loaded claims; flag potential bias and limitations when relevant.`;

const OPERIQ_TO_PROVIDER: Record<string, string> = {
  "operiq-ultra": "mistralai/mistral-large-3-675b-instruct-2512",
  "operiq-pro": "meta/llama-3.3-70b-instruct",
  "operiq-plus": "nvidia/llama-3.3-nemotron-super-49b-v1",
  "operiq-nano": "nvidia/nvidia-nemotron-nano-9b-v2",
  "operiq-mini": "nvidia/nemotron-mini-4b-instruct",
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        // Usage limit check (before processing)
        const usageCheck = await checkUsageLimit(request);
        if (!usageCheck.allowed) {
          return Response.json(
            {
              error: "Usage limit exceeded",
              plan: usageCheck.plan ?? "free",
              upgradeUrl: "/settings/billing",
            },
            { status: 429 },
          );
        }

        let provider;
        try {
          provider = getProvider();
        } catch (e) {
          return Response.json({ error: "AI provider not configured: " + (e instanceof Error ? e.message : "unknown") }, { status: 500 });
        }
        const modelName =
          request.headers.get("x-operiq-model") ??
          process.env.AI_MODEL ??
          "gpt-4o-mini";

        const actualModel = OPERIQ_TO_PROVIDER[modelName] ?? modelName;

        const agentMode = request.headers.get("x-operiq-agent-mode") === "on";

        try {
          const result = agentMode
            ? await handleAgentMode(provider, actualModel, messages)
            : streamText({
                model: provider(actualModel),
                system: SYSTEM_PROMPT,
                messages: await convertToModelMessages(messages),
              });

          const response = result.toUIMessageStreamResponse({ originalMessages: messages });

          // Track usage after streaming is initiated (fire-and-forget)
          trackAiUsage(request).catch((e) =>
            console.warn("Failed to track AI usage:", e),
          );

          return response;
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

/* ------------------------------------------------------------------ */
/*  Agent Mode Handler — uses AI SDK native multi-step tool calling   */
/* ------------------------------------------------------------------ */

async function handleAgentMode(
  provider: ReturnType<typeof getProvider>,
  modelName: string,
  messages: UIMessage[],
) {
  const sdkTools = toolsToAISDK();

  return streamText({
    model: provider(modelName),
    messages: await convertToModelMessages(messages),
    tools: sdkTools,
    system: SYSTEM_PROMPT + "\n\n" + AGENT_SYSTEM_EXTENSION,
    temperature: 0.3,
    maxSteps: 10,
  });
}
