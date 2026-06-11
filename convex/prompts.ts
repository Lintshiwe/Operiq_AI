/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * Prompt library backend — CRUD for saved user prompts.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ------------------------------------------------------------------ */
/*  Queries                                                           */
/* ------------------------------------------------------------------ */

/**
 * List all prompts for the authenticated user.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("prompts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */

/**
 * Create a new prompt.
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const id = await ctx.db.insert("prompts", {
      userId,
      title: args.title,
      content: args.content,
      category: args.category,
      createdAt: new Date().toISOString(),
    });

    return { success: true, promptId: id };
  },
});

/**
 * Update an existing prompt.
 */
export const update = mutation({
  args: {
    promptId: v.id("prompts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.userId !== userId) {
      throw new Error("Prompt not found");
    }

    const patch: Record<string, string> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.content !== undefined) patch.content = args.content;
    if (args.category !== undefined) patch.category = args.category;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.promptId, patch);
    }

    return { success: true };
  },
});

/**
 * Remove a prompt.
 */
export const remove = mutation({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt || prompt.userId !== userId) {
      throw new Error("Prompt not found");
    }

    await ctx.db.delete(args.promptId);
    return { success: true };
  },
});
