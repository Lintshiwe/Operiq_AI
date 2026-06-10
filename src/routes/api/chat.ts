/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { getProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { runAgentLoop, type AgentStep } from "@/lib/agent-loop";
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

        // Fire-and-forget usage tracking (non-blocking)
        trackAiUsage(request).catch((e) =>
          console.warn("Failed to track AI usage:", e),
        );

        const provider = getProvider();
        const modelName =
          request.headers.get("x-operiq-model") ??
          process.env.AI_MODEL ??
          "gpt-4o-mini";

        const actualModel = OPERIQ_TO_PROVIDER[modelName] ?? modelName;

        const agentMode = request.headers.get("x-operiq-agent-mode") === "on";

        if (agentMode) {
          return handleAgentMode(provider, actualModel, messages);
        }

        try {
          const result = streamText({
            model: provider(actualModel),
            system: SYSTEM_PROMPT,
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

/* ------------------------------------------------------------------ */
/*  Agent Mode Handler                                                */
/* ------------------------------------------------------------------ */

function handleAgentMode(
  provider: ReturnType<typeof getProvider>,
  actualModel: string,
  messages: UIMessage[],
): Response {
  // Extract the last user message for the agent
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const userMessage = lastUserMsg
    ? lastUserMsg.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join(" ")
        .trim()
    : "";

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const encoder = new TextEncoder();
  const messageId = `agent_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  const stream = new ReadableStream({
    async start(controller) {
      const write = (type: string, data: unknown) => {
        controller.enqueue(encoder.encode(`${type}:${JSON.stringify(data)}\n`));
      };

      try {
        // Start frame
        write("f", { messageId });

        const agentResult = await runAgentLoop(
          {
            maxSteps: 10,
            model: provider(actualModel),
            systemPrompt: SYSTEM_PROMPT,
          },
          userMessage,
          (step: AgentStep) => {
            // Stream each agent step as it happens
            const parts: string[] = [];

            if (step.action) {
              parts.push(
                `\n**Using tool:** \`${step.action.name}\` (${JSON.stringify(step.action.params)})\n`,
              );
            }

            if (step.observation) {
              const summary =
                step.observation.length > 500
                  ? step.observation.substring(0, 500) + "..."
                  : step.observation;
              parts.push(`**Result:** ${summary}\n`);
            }

            if (parts.length > 0) {
              write("0", parts.join(""));
            }
          },
        );

        // Write final answer
        write("0", `\n${agentResult.finalAnswer}`);

        // End frame
        write("e", { finishReason: "stop" });

        controller.close();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Agent execution failed";
        write("0", `\n**Error:** ${errorMsg}`);
        write("e", { finishReason: "error" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "x-vercel-ai-ui-message-stream": "v1",
    },
  });
}
