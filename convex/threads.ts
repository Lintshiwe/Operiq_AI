/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const ownedThreads = await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const sharedChats = await ctx.db
      .query("sharedChats")
      .withIndex("by_threadId")
      .filter((q) => q.eq("isActive", true))
      .collect();

    const sharedThreadIds = sharedChats
      .filter((sc) => sc.invitedUserIds.includes(userId))
      .map((sc) => sc.threadId);

    const existingIds = new Set(ownedThreads.map((t) => t._id));
    const newSharedThreadIds = sharedThreadIds.filter(
      (id) => !existingIds.has(id),
    );

    const sharedThreads = (
      await Promise.all(newSharedThreadIds.map((id) => ctx.db.get(id)))
    ).filter((t): t is NonNullable<typeof t> => t !== null);

    const allThreads = [...ownedThreads, ...sharedThreads]
      .filter((t) => t.messages && t.messages.length > 0);
    allThreads.sort(
      (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    );

    return allThreads;
  },
});

export const get = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) return null;

    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    if (thread.userId === userId) return thread;

    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq("isActive", true))
      .first();

    if (sharedChat && sharedChat.invitedUserIds.includes(userId)) {
      return thread;
    }

    return null;
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