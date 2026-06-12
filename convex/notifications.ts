/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * Notification backend — in-app alerts for shares, mentions, and system notices.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ------------------------------------------------------------------ */
/*  Queries                                                           */
/* ------------------------------------------------------------------ */

/**
 * List notifications for the authenticated user (newest first, max 50).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */

/**
 * Mark a single notification as read.
 */
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { read: true });
    return { success: true };
  },
});

/**
 * Mark all notifications for the authenticated user as read.
 */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq("read", false as any))
      .collect();

    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { read: true })),
    );

    return { success: true, count: unread.length };
  },
});

/* ------------------------------------------------------------------ */
/*  Internal — System Notifications                                   */
/* ------------------------------------------------------------------ */

/**
 * Create a system notification for a specific user.
 * Can be called from other mutations (e.g., after signup).
 */
export const createSystem = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type ?? "system",
      title: args.title,
      body: args.body,
      read: false,
      createdAt: new Date().toISOString(),
    });
  },
});

/**
 * Create a share notification when a thread is shared with a user.
 */
export const createShareNotification = internalMutation({
  args: {
    userId: v.id("users"),
    threadId: v.id("threads"),
    sharerName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "share",
      title: "Thread shared with you",
      body: `${args.sharerName} shared a thread with you`,
      read: false,
      metadata: { threadId: args.threadId },
      createdAt: new Date().toISOString(),
    });
  },
});
