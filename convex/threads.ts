import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.string(),
        content: v.string(),
        createdAt: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = new Date().toISOString();
    return await ctx.db.insert("threads", {
      userId,
      title: args.title,
      messages: args.messages,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    threadId: v.id("threads"),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.string(),
        content: v.string(),
        createdAt: v.optional(v.string()),
      }),
    ),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      messages: args.messages,
      updatedAt: new Date().toISOString(),
    };
    if (args.title !== undefined) patch.title = args.title;
    await ctx.db.patch(args.threadId, patch);
  },
});

export const remove = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.threadId);
  },
});

export const importMany = mutation({
  args: {
    threads: v.array(
      v.object({
        title: v.string(),
        messages: v.array(
          v.object({
            id: v.string(),
            role: v.string(),
            content: v.string(),
            createdAt: v.optional(v.string()),
          }),
        ),
        createdAt: v.string(),
        updatedAt: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    for (const thread of args.threads) {
      await ctx.db.insert("threads", {
        userId,
        ...thread,
      });
    }
  },
});
