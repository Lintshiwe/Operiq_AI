/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ------------------------------------------------------------------ */
/*  Plan Limits                                                       */
/* ------------------------------------------------------------------ */

const PLAN_LIMITS = {
  free: {
    aiRequestsLimit: 50,
    imagesLimit: 5,
    storageLimit: 50 * 1024 * 1024, // 50 MB
  },
  pro: {
    aiRequestsLimit: 500,
    imagesLimit: 50,
    storageLimit: 500 * 1024 * 1024, // 500 MB
  },
  enterprise: {
    aiRequestsLimit: 999999,
    imagesLimit: 999999,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5 GB
  },
} as const;

type Plan = keyof typeof PLAN_LIMITS;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

async function getOrCreateBilling(
  ctx: { db: any; auth: any },
): Promise<{ _id: any } & Record<string, unknown>> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const existing = await ctx.db
    .query("billing")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (existing) return existing;

  const now = new Date().toISOString();
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const id = await ctx.db.insert("billing", {
    userId,
    plan: "free",
    aiRequestsUsed: 0,
    aiRequestsLimit: PLAN_LIMITS.free.aiRequestsLimit,
    imagesGenerated: 0,
    imagesLimit: PLAN_LIMITS.free.imagesLimit,
    storageUsed: 0,
    storageLimit: PLAN_LIMITS.free.storageLimit,
    subscriptionStatus: "active",
    currentPeriodStart: now,
    currentPeriodEnd: thirtyDays,
    createdAt: now,
  });

  return { _id: id, ...(await ctx.db.get(id)) };
}

/* ------------------------------------------------------------------ */
/*  Internal: Reset usage counters when billing period ends           */
/* ------------------------------------------------------------------ */

/**
 * Checks if the current billing period has ended and, if so, resets
 * usage counters and advances to the next 30-day period.
 * Safe to call before any billing read/write — it's idempotent.
 */
export const resetUsage = internalMutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("billing")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .first();

    if (!existing) return;

    const now = Date.now();
    const periodEnd = new Date(existing.currentPeriodEnd as string).getTime();

    // If period hasn't ended yet, nothing to do
    if (now < periodEnd) return;

    // Advance to next 30-day period
    const newStart = new Date(periodEnd).toISOString();
    const newEnd = new Date(periodEnd + 30 * 24 * 60 * 60 * 1000).toISOString();

    await ctx.db.patch(existing._id, {
      aiRequestsUsed: 0,
      imagesGenerated: 0,
      currentPeriodStart: newStart,
      currentPeriodEnd: newEnd,
    });
  },
});

/* ------------------------------------------------------------------ */
/*  Queries                                                           */
/* ------------------------------------------------------------------ */

export const getBilling = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Note: queries can't call mutations, so we check period in-band
      const billing = await getOrCreateBilling(ctx);

      // Check if period has ended and return reset values if so
      const now = Date.now();
      const periodEnd = new Date(billing.currentPeriodEnd as string).getTime();

      if (now >= periodEnd) {
        // Return the record with usage zeroed (optimistic — actual reset happens on next mutation)
        return {
          ...billing,
          aiRequestsUsed: 0,
          imagesGenerated: 0,
        };
      }

      return billing;
    } catch {
      return null;
    }
  },
});

/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */

export const upgradePlan = mutation({
  args: {
    plan: v.union(v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    try {
      const billing = await getOrCreateBilling(ctx);
      const limits = PLAN_LIMITS[args.plan as Plan];

      const now = new Date().toISOString();
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await ctx.db.patch(billing._id, {
        plan: args.plan,
        subscriptionStatus: "active",
        aiRequestsLimit: limits.aiRequestsLimit,
        imagesLimit: limits.imagesLimit,
        storageLimit: limits.storageLimit,
        currentPeriodStart: now,
        currentPeriodEnd: thirtyDays,
        aiRequestsUsed: 0,
        imagesGenerated: 0,
      });

      return { success: true, plan: args.plan };
    } catch {
      return { success: false, error: "Not authenticated" };
    }
  },
});

export const cancelSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const billing = await ctx.db
      .query("billing")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .first();

    if (!billing) {
      throw new Error("No active subscription");
    }

    await ctx.db.patch(billing._id, {
      subscriptionStatus: "canceled",
    });

    return { success: true };
  },
});

export const recordAiRequest = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Check and reset usage period if needed
      await resetUsageHandler(ctx);

      const billing = await getOrCreateBilling(ctx);

      const newCount = ((billing.aiRequestsUsed as number) || 0) + 1;
      await ctx.db.patch(billing._id, {
        aiRequestsUsed: newCount,
      });

      return { success: true, aiRequestsUsed: newCount };
    } catch {
      return { success: false, error: "Not authenticated" };
    }
  },
});

export const recordImageGeneration = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Check and reset usage period if needed
      await resetUsageHandler(ctx);

      const billing = await getOrCreateBilling(ctx);

      const newCount = ((billing.imagesGenerated as number) || 0) + 1;
      await ctx.db.patch(billing._id, {
        imagesGenerated: newCount,
      });

      return { success: true, imagesGenerated: newCount };
    } catch {
      return { success: false, error: "Not authenticated" };
    }
  },
});

/* ------------------------------------------------------------------ */
/*  Inline reset helper (called within mutations)                     */
/* ------------------------------------------------------------------ */

async function resetUsageHandler(
  ctx: { db: any; auth: any },
): Promise<void> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return;

  const existing = await ctx.db
    .query("billing")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!existing) return;

  const now = Date.now();
  const periodEnd = new Date(existing.currentPeriodEnd as string).getTime();

  if (now < periodEnd) return;

  const newStart = new Date(periodEnd).toISOString();
  const newEnd = new Date(periodEnd + 30 * 24 * 60 * 60 * 1000).toISOString();

  await ctx.db.patch(existing._id, {
    aiRequestsUsed: 0,
    imagesGenerated: 0,
    currentPeriodStart: newStart,
    currentPeriodEnd: newEnd,
  });
}
