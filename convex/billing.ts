/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
/*  Queries                                                           */
/* ------------------------------------------------------------------ */

export const getBilling = query({
  args: {},
  handler: async (ctx) => {
    const billing = await getOrCreateBilling(ctx);
    return billing;
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
    });

    return { success: true, plan: args.plan };
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
    const billing = await getOrCreateBilling(ctx);

    await ctx.db.patch(billing._id, {
      aiRequestsUsed: (billing.aiRequestsUsed as number) + 1,
    });

    return { success: true, aiRequestsUsed: (billing.aiRequestsUsed as number) + 1 };
  },
});

export const recordImageGeneration = mutation({
  args: {},
  handler: async (ctx) => {
    const billing = await getOrCreateBilling(ctx);

    await ctx.db.patch(billing._id, {
      imagesGenerated: (billing.imagesGenerated as number) + 1,
    });

    return { success: true, imagesGenerated: (billing.imagesGenerated as number) + 1 };
  },
});
