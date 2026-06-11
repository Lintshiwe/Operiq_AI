/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { httpRouter, httpActionGeneric } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

/* ------------------------------------------------------------------ */
/*  Chat Action — proxies to OpenAI-compatible API                    */
/* ------------------------------------------------------------------ */

const chatAction = httpActionGeneric(async (ctx, request) => {
  const { messages, model: modelName } = await request.json();
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI not configured" }),
      { status: 500 },
    );
  }

  const response = await fetch(
    `${baseUrl || "https://api.openai.com/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName || "gpt-4o-mini",
        messages,
        stream: false,
      }),
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
});

http.route({
  path: "/chat",
  method: "POST",
  handler: chatAction,
});

/* ------------------------------------------------------------------ */
/*  Code Action — proxies to OpenAI-compatible API with system prompt */
/* ------------------------------------------------------------------ */

const CODE_SYSTEM_PROMPT = `You are Operiq Code, an expert software engineering AI that helps users build complete projects.

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
- For large projects, propose an architecture first and ask for confirmation before implementing`;

const codeAction = httpActionGeneric(async (ctx, request) => {
  const { messages, model: modelName } = await request.json();
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI not configured" }),
      { status: 500 },
    );
  }

  const fullMessages = [
    { role: "system", content: CODE_SYSTEM_PROMPT },
    ...messages,
  ];

  const response = await fetch(
    `${baseUrl || "https://api.openai.com/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName || "gpt-4o-mini",
        messages: fullMessages,
        stream: false,
      }),
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
});

http.route({
  path: "/code",
  method: "POST",
  handler: codeAction,
});

export default http;
