/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchAnalyses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    material: v.string(),
    question: v.optional(v.string()),
    depth: v.optional(v.string()),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchAnalyses", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});