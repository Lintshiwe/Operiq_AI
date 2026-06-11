/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * API key management for external developer access.
 */

import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ------------------------------------------------------------------ */
/*  Queries                                                           */
/* ------------------------------------------------------------------ */

/**
 * List all API keys for the authenticated user.
 * Full key is never returned — only a masked "opr_...XXXX" prefix.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return keys.map((k) => ({
      _id: k._id,
      name: k.name,
      key: maskKey(k.key),
      isActive: k.isActive,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt ?? null,
    }));
  },
});

/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */

/**
 * Generate a new API key. Returns the full key (only time it is shown).
 */
export const generate = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const rawKey = generateKey();
    const prefix = rawKey.slice(0, 8);
    const hash = await hashKey(rawKey);

    await ctx.db.insert("apiKeys", {
      userId,
      name: args.name,
      key: prefix,
      fullKey: hash,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return { key: rawKey };
  },
});

/**
 * Revoke (deactivate) an API key.
 */
export const revoke = mutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const key = await ctx.db.get(args.keyId);
    if (!key || key.userId !== userId) {
      throw new Error("API key not found");
    }

    await ctx.db.patch(args.keyId, { isActive: false });
    return { success: true };
  },
});

/* ------------------------------------------------------------------ */
/*  Internal — Validation                                              */
/* ------------------------------------------------------------------ */

/**
 * Validate an API key. Returns the user ID if valid, null otherwise.
 * Also updates lastUsedAt on successful validation.
 */
export const validate = internalQuery({
  args: { fullKey: v.string() },
  handler: async (ctx, args) => {
    const hash = await hashKey(args.fullKey);

    const match = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("fullKey", hash))
      .first();

    if (!match || !match.isActive) return null;

    // Update lastUsedAt (best-effort — internalQuery is read-only,
    // so we return the userId and the caller can trigger a mutation)
    return {
      userId: match.userId,
      keyId: match._id,
      name: match.name,
    };
  },
});

/**
 * Record last usage of an API key.
 */
export const recordUsage = mutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.keyId);
    if (!key || !key.isActive) return;

    await ctx.db.patch(args.keyId, {
      lastUsedAt: new Date().toISOString(),
    });
  },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateKey(): string {
  const prefix = "opr_";
  const chars = "abcdef0123456789";
  let key = "";
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < 32; i++) {
    key += chars[array[i] % chars.length];
  }
  return prefix + key;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function maskKey(prefix: string): string {
  if (prefix.length <= 4) return prefix + "****";
  return `${prefix.slice(0, 4)}****${prefix.slice(-4)}`;
}
