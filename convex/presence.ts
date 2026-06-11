/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * Real-time presence tracking for thread collaboration.
 * Shows which users are currently viewing a given thread.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const PRESENCE_TTL_MS = 60_000; // 60 seconds — viewers are "online" if heartbeat received within this window

/* ------------------------------------------------------------------ */
/*  Queries                                                           */
/* ------------------------------------------------------------------ */

/**
 * Returns a list of users currently viewing the given thread.
 * A user is considered "viewing" if they sent a heartbeat within
 * the last 60 seconds.
 */
export const getViewers = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const presences = await ctx.db
      .query("presence")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    const cutoff = Date.now() - PRESENCE_TTL_MS;

    const activePresences = presences.filter(
      (p) => new Date(p.lastSeen).getTime() > cutoff,
    );

    const viewers = await Promise.all(
      activePresences.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          userId: p.userId,
          email: user?.email ?? "",
          name: user?.name ?? "",
          lastSeen: p.lastSeen,
        };
      }),
    );

    return viewers;
  },
});

/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */

/**
 * Record a heartbeat for the current user on a thread.
 * Clients should call this every ~30 seconds while viewing a thread.
 */
export const heartbeat = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_thread", (q) =>
        q.eq("userId", userId).eq("threadId", args.threadId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: now });
    } else {
      await ctx.db.insert("presence", {
        userId,
        threadId: args.threadId,
        lastSeen: now,
      });
    }
  },
});
