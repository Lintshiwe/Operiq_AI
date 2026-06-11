/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * External chat API endpoint at POST /api/v1/chat.
 * Accepts API key auth via Bearer token.
 */

import { createFileRoute } from "@tanstack/react-router";
import { validateApiKey, recordApiKeyUsage } from "@/lib/api-auth";

function checkRateLimit(keyHash: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(keyHash);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(keyHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

export const Route = createFileRoute("/api/v1/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // --- Auth ---
        const authResult = await validateApiKey(request);
        if (!authResult.authenticated) {
          return Response.json(
            { error: authResult.error ?? "Unauthorized" },
            { status: 401 },
          );
        }

        // --- Rate Limit ---
        const rateKey = authResult.userId ?? "unknown";
        const rateLimit = checkRateLimit(rateKey);
        if (!rateLimit.allowed) {
          return Response.json(
            {
              error: "Rate limit exceeded",
              retryAfter: rateLimit.retryAfter,
            },
            {
              status: 429,
              headers: rateLimit.retryAfter
                ? { "Retry-After": String(rateLimit.retryAfter) }
                : {},
            },
          );
        }

        // --- Parse body ---
        let body: { messages?: unknown[]; model?: string } = {};
        try {
          body = (await request.json()) as { messages?: unknown[]; model?: string };
        } catch {
          return Response.json(
            { error: "Invalid JSON body" },
            { status: 400 },
          );
        }

        if (!body.messages || !Array.isArray(body.messages)) {
          return Response.json(
            { error: "messages array is required" },
            { status: 400 },
          );
        }

        // Validate messages format
        for (const msg of body.messages) {
          if (
            typeof msg !== "object" ||
            !msg ||
            !("role" in msg) ||
            !("content" in msg)
          ) {
            return Response.json(
              { error: "Each message must have 'role' and 'content' fields" },
              { status: 400 },
            );
          }
        }

        // --- Call AI ---
        const apiKey = process.env.AI_API_KEY;
        const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
        const model = body.model ?? process.env.AI_MODEL ?? "gpt-4o-mini";

        if (!apiKey || !baseUrl) {
          return Response.json(
            { error: "AI service not configured" },
            { status: 500 },
          );
        }

        try {
          const aiMessages = [
            {
              role: "system",
              content:
                "You are Operiq AI, a helpful AI assistant. Be concise, professional, and well-structured.",
            },
            ...(body.messages as Array<{ role: string; content: string }>),
          ];

          const resp = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: aiMessages,
              temperature: 0.7,
              max_tokens: 2048,
            }),
          });

          if (!resp.ok) {
            const errorText = await resp.text();
            return Response.json(
              { error: `AI API error (${resp.status}): ${errorText}` },
              { status: 502 },
            );
          }

          const data = (await resp.json()) as {
            choices?: Array<{ message?: { role?: string; content?: string } }>;
          };

          // Record API key usage (fire-and-forget)
          if (authResult.keyId) {
            recordApiKeyUsage(authResult.keyId).catch((e) =>
              console.warn("Failed to record API key usage:", e),
            );
          }

          const completion =
            data.choices?.[0]?.message?.content ?? "";

          return Response.json({
            role: "assistant",
            content: completion,
            model,
          });
        } catch (err) {
          console.error("AI chat error:", err);
          return Response.json(
            { error: err instanceof Error ? err.message : "AI request failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});
