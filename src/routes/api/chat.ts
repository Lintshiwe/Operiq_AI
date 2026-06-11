/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential.
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const messages = body.messages;
          if (!Array.isArray(messages)) {
            return Response.json({ error: "Messages required" }, { status: 400 });
          }

          const apiKey = process.env.AI_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "AI not configured" }, { status: 500 });
          }

          const model = request.headers.get("x-operiq-model") || process.env.AI_MODEL || "gpt-4o-mini";

          const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
          const endpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;

          const response = await fetch(endpoint,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({ model, messages, stream: false }),
            },
          );

          if (!response.ok) {
            const err = await response.text();
            return Response.json({ error: err }, { status: response.status });
          }

          const data = await response.json();
          return Response.json(data);
        } catch (e: any) {
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});
