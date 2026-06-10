import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
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

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const provider = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: provider("google/gemini-3-flash-preview"),
            system: `You are FlowDesk AI, a calm, precise executive productivity assistant for working professionals.
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
