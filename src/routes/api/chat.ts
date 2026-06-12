/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential.
 *
 * Chat API — NVIDIA AI backend in SSE format for AI SDK v6 useChat hook.
 * Returns a text/event-stream that the DefaultChatTransport can parse.
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          let messages = body.messages;

          if (!Array.isArray(messages)) {
            return Response.json({ error: "Messages required" }, { status: 400 });
          }

          // Strip SDK-specific fields — send only {role, content}
          // AI SDK v6 uses `parts` array instead of `content` field
          messages = messages.map((m: any) => ({
            role: m.role,
            content: m.content
              ? (typeof m.content === "string" ? m.content : JSON.stringify(m.content))
              : (Array.isArray(m.parts)
                  ? m.parts.map((p: any) => p.type === "text" ? p.text : "").filter(Boolean).join("\n")
                  : ""),
          }));

          // Filter out empty messages
          messages = messages.filter((m: any) => m.role && m.content);
          if (messages.length === 0) {
            return Response.json({ error: "No valid messages to send" }, { status: 400 });
          }

          const apiKey = process.env.AI_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "AI not configured" }, { status: 500 });
          }

          const rawModel = request.headers.get("x-operiq-model") || process.env.AI_MODEL || "operiq-mini";
          const MODEL_MAP: Record<string, string> = {
            "operiq-ultra": "mistralai/mistral-large-3-675b-instruct-2512",
            "operiq-pro": "meta/llama-3.3-70b-instruct",
            "operiq-plus": "nvidia/llama-3.3-nemotron-super-49b-v1",
            "operiq-nano": "nvidia/nvidia-nemotron-nano-9b-v2",
            "operiq-mini": "nvidia/nemotron-mini-4b-instruct",
          };
          const model = MODEL_MAP[rawModel] || rawModel;

          const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
          const endpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;

          // Get the full response from NVIDIA first
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model, messages, stream: false }),
          });

          const data = await response.json();

          if (!response.ok) {
            const errorMsg = data?.error?.message || data?.error || "The AI service returned an error. Please try again.";
            return Response.json({ error: errorMsg }, { status: response.status });
          }

          // Extract the response text
          const text = data.choices?.[0]?.message?.content || "";
          const messageId = data.id || `chat-${Date.now()}`;

          // Generate a unique ID for this response message
          const responseId = messageId;

          // Stream the response back as SSE in AI SDK v6 format
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              // text-start
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-start", id: responseId })}\n\n`));

              // text-delta — send the full content as one chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-delta", id: responseId, delta: text })}\n\n`));

              // text-end
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: responseId })}\n\n`));

              controller.close();
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (e: any) {
          return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
        }
      },
    },
  },
});
