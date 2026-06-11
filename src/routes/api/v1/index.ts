/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * Public API endpoint for external API key access.
 * POST /api/v1/chat  — chat completion
 * GET  /api/v1       — API documentation
 */

import { createFileRoute } from "@tanstack/react-router";
import { validateApiKey, recordApiKeyUsage } from "@/lib/api-auth";

const CONVEX_URL =
  process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL ?? "";

/* ------------------------------------------------------------------ */
/*  Rate Limiting (simple in-memory per-key limit)                     */
/* ------------------------------------------------------------------ */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

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

/* ------------------------------------------------------------------ */
/*  GET /api/v1 — API documentation                                    */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/api/v1/")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          name: "Operiq AI API",
          version: "1.0.0",
          description: "External API for integrating with Operiq AI services.",
          baseUrl: "/api/v1",
          endpoints: {
            "POST /chat": {
              description: "Send a chat completion request using your API key.",
              authentication: "Bearer <opr_...>",
              body: {
                messages: [
                  { role: "user | assistant | system", content: "string" },
                ],
                model: "string (optional)",
              },
              example: {
                messages: [
                  { role: "user", content: "What is Operiq AI?" },
                ],
              },
              rateLimit: "10 requests per minute per API key",
            },
          },
          authentication: "Include your API key as: Authorization: Bearer opr_your_key_here",
          getApiKey: "Generate an API key in your Operiq AI dashboard settings.",
        });
      },
    },
  },
});
