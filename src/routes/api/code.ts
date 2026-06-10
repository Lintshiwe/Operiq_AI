/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { getProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const Route = createFileRoute("/api/code")({
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
            system: `You are Operiq Code, an expert software engineering AI that helps users build complete projects.

Your capabilities:
- Design and scaffold full project architectures (frontend, backend, database, APIs)
- Generate complete, runnable file implementations with proper imports
- Create project plans with file structure, technology choices, and step-by-step guides
- Debug complex multi-file issues
- Explain architecture trade-offs and patterns
- Review code for bugs, security, performance

Rules:
- When asked to create a project, plan the architecture first, then implement file by file
- Always show complete, runnable code with correct imports
- Use markdown code blocks with language tags
- For multi-file projects, clearly label each file (e.g., \`// src/components/Button.tsx\`)
- Prefer modern, idiomatic solutions
- Be concise but thorough — explain the "why"
- Flag potential security or performance concerns
- Never write malicious code
- For large projects, propose an architecture first and ask for confirmation before implementing`,
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