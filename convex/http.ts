/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential.
 */

import { httpRouter, httpActionGeneric } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

/* ------------------------------------------------------------------ */
/*  Chat Action                                                       */
/* ------------------------------------------------------------------ */

http.route({
  path: "/chat",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    const { messages, model: modelName } = await request.json();
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500 });
    }

    const response = await fetch(
      `${baseUrl || "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName || "gpt-4o-mini", messages, stream: false }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      return new Response(err, { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  }),
});

/* ------------------------------------------------------------------ */
/*  Code Action                                                       */
/* ------------------------------------------------------------------ */

const CODE_SYSTEM_PROMPT = `You are Operiq Code, an expert software engineering AI.
Generate complete, runnable code with proper imports. Use markdown code blocks with language tags. Be concise but thorough.`;

http.route({
  path: "/code",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    const { messages, model: modelName } = await request.json();
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500 });
    }

    const fullMessages = [{ role: "system", content: CODE_SYSTEM_PROMPT }, ...messages];

    const response = await fetch(
      `${baseUrl || "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName || "gpt-4o-mini", messages: fullMessages, stream: false }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      return new Response(err, { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  }),
});

export default http;
