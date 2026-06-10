/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * Server-side usage tracking middleware.
 * Communicates with the Convex backend via its HTTP API to record
 * AI requests, image generations, and check usage limits.
 *
 * Because TanStack Start API routes receive cookies from the browser,
 * we forward them to Convex so authenticated mutations/queries work.
 */

const CONVEX_URL =
  process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL ?? "";

interface UsageLimit {
  allowed: boolean;
  reason?: string;
  plan?: string;
  used?: number;
  limit?: number;
}

/**
 * Check if the current user has remaining AI request capacity.
 * Returns { allowed: boolean, reason?, plan? }.
 */
export async function checkUsageLimit(
  request: Request,
): Promise<UsageLimit> {
  if (!CONVEX_URL) {
    console.warn("Convex URL not configured — allowing request");
    return { allowed: true };
  }

  const cookies = request.headers.get("cookie") || "";

  try {
    const resp = await fetch(`${CONVEX_URL}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookies,
      },
      body: JSON.stringify({
        path: "billing:getBilling",
        args: {},
        format: "json",
      }),
    });

    if (!resp.ok) {
      console.warn("Usage check failed — allowing request");
      return { allowed: true };
    }

    const data = (await resp.json()) as {
      value?: {
        aiRequestsUsed: number;
        aiRequestsLimit: number;
        plan: string;
      };
    };

    const billing = data.value;
    if (!billing) return { allowed: true };

    if (billing.aiRequestsUsed >= billing.aiRequestsLimit) {
      return {
        allowed: false,
        reason: `You have reached your AI request limit (${billing.aiRequestsLimit} requests) on the ${billing.plan} plan. Please upgrade to continue.`,
        plan: billing.plan,
        used: billing.aiRequestsUsed,
        limit: billing.aiRequestsLimit,
      };
    }

    return { allowed: true, plan: billing.plan };
  } catch (err) {
    console.warn("Usage limit check failed — allowing request:", err);
    return { allowed: true };
  }
}

/**
 * Record an AI request (chat message) against the authenticated user's
 * billing record. Safe to call; failures are logged but never throw.
 */
export async function trackAiUsage(request: Request): Promise<void> {
  if (!CONVEX_URL) return;

  const cookies = request.headers.get("cookie") || "";

  try {
    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookies,
      },
      body: JSON.stringify({
        path: "billing:recordAiRequest",
        args: {},
        format: "json",
      }),
    });
  } catch (err) {
    console.warn("Failed to track AI usage:", err);
  }
}

/**
 * Record an image generation against the authenticated user's billing
 * record. Safe to call; failures are logged but never throw.
 */
export async function trackImageUsage(request: Request): Promise<void> {
  if (!CONVEX_URL) return;

  const cookies = request.headers.get("cookie") || "";

  try {
    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookies,
      },
      body: JSON.stringify({
        path: "billing:recordImageGeneration",
        args: {},
        format: "json",
      }),
    });
  } catch (err) {
    console.warn("Failed to track image usage:", err);
  }
}
