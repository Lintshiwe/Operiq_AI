/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

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
        const modelName =
          request.headers.get("x-operiq-model") ??
          process.env.AI_MODEL ??
          "gpt-4o-mini";

        const OPERIQ_TO_PROVIDER: Record<string, string> = {
          "operiq-ultra": "mistralai/mistral-large-3-675b-instruct-2512",
          "operiq-pro":   "meta/llama-3.3-70b-instruct",
          "operiq-plus":  "nvidia/llama-3.3-nemotron-super-49b-v1",
          "operiq-nano":  "nvidia/nvidia-nemotron-nano-9b-v2",
          "operiq-mini":  "nvidia/nemotron-mini-4b-instruct",
        };

        const actualModel = OPERIQ_TO_PROVIDER[modelName] ?? modelName;

        try {
          const result = streamText({
            model: provider(actualModel),
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