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
        const modelName = process.env.AI_MODEL ?? "gpt-4o-mini";

        try {
          const result = streamText({
            model: provider(modelName),
            system: `You are Operiq Code, a senior software engineering assistant integrated into the Operiq AI productivity platform.

Your sole purpose is to help users with software development tasks:
- Write, debug, review, and refactor code
- Explain programming concepts with clear examples
- Suggest architecture patterns and best practices
- Troubleshoot errors and performance issues
- Generate code snippets, utility functions, and full file implementations
- Answer questions about frameworks, libraries, APIs, and tools

Rules:
- Always show complete, runnable code examples when relevant.
- Use markdown code blocks with the correct language tag for syntax highlighting.
- Prefer modern, idiomatic solutions (ESNext for JS/TS, latest stable for other languages).
- When suggesting changes to existing code, show a diff or clearly indicate what to replace.
- If the user's code has bugs or security issues, point them out constructively.
- Be concise but thorough — explain the "why" behind your recommendations.
- When uncertain, say so. Flag potential performance, security, or compatibility concerns.
- Do not write code for malicious purposes. If a request seems unsafe, explain why.`,
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
