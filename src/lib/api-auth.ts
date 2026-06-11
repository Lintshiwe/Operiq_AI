/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * API key authentication middleware for external API access.
 * Validates Bearer tokens in the format "opr_..." against the
 * apiKeys table before allowing requests to proceed.
 */

import { getConvexServerClient } from "./convex-client.server";
import type { api } from "../../convex/_generated/api";

const CONVEX_URL =
  process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL ?? "";

/**
 * Result of API key validation.
 */
export interface ApiAuthResult {
  authenticated: boolean;
  userId?: string;
  keyId?: string;
  error?: string;
}

/**
 * Validate an API key from an incoming request's Authorization header.
 * If valid, returns the authenticated user's data. The caller should
 * also call `recordApiKeyUsage` after successful API processing.
 */
export async function validateApiKey(
  request: Request,
): Promise<ApiAuthResult> {
  const authHeader = request.headers.get("Authorization") ?? "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!bearerMatch) {
    return { authenticated: false, error: "Missing or invalid Authorization header" };
  }

  const rawKey = bearerMatch[1].trim();

  if (!rawKey.startsWith("opr_")) {
    return { authenticated: false, error: "Invalid API key format" };
  }

  if (!CONVEX_URL) {
    console.warn("Convex URL not configured — allowing request");
    return { authenticated: true, userId: "unknown", keyId: undefined };
  }

  try {
    const resp = await fetch(`${CONVEX_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "apiKeys:validate",
        args: { fullKey: rawKey },
        format: "json",
      }),
    });

    if (!resp.ok) {
      console.warn("API key validation query failed");
      return { authenticated: false, error: "Authentication service unavailable" };
    }

    const data = (await resp.json()) as {
      value?: {
        userId: string;
        keyId: string;
        name: string;
      } | null;
    };

    if (!data.value) {
      return { authenticated: false, error: "Invalid or revoked API key" };
    }

    return {
      authenticated: true,
      userId: data.value.userId,
      keyId: data.value.keyId,
    };
  } catch (err) {
    console.error("API key validation error:", err);
    return { authenticated: false, error: "Authentication service error" };
  }
}

/**
 * Record that an API key was used (updates lastUsedAt).
 */
export async function recordApiKeyUsage(keyId: string): Promise<void> {
  if (!CONVEX_URL || !keyId) return;

  try {
    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "apiKeys:recordUsage",
        args: { keyId },
        format: "json",
      }),
    });
  } catch (err) {
    console.warn("Failed to record API key usage:", err);
  }
}
