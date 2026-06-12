/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createInvite = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for existing active invite for this user on this thread
    const existing = await ctx.db
      .query("sharedChats")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq("isActive", true as any))
      .collect();

    const activeInvite = existing.find((sc) => sc.ownerId === userId);
    if (activeInvite) {
      return { token: activeInvite.token, inviteLink: `https://operiq-ai.netlify.app/invite/${activeInvite.token}` };
    }

    const token = crypto.randomUUID();
    await ctx.db.insert("sharedChats", {
      threadId: args.threadId,
      ownerId: userId,
      token,
      isActive: true,
      createdAt: new Date().toISOString(),
      invitedUserIds: [],
    });

    return { token, inviteLink: `https://operiq-ai.netlify.app/invite/${token}` };
  },
});

export const revokeInvite = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invites = await ctx.db
      .query("sharedChats")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq("isActive", true as any))
      .collect();

    const activeInvite = invites.find((sc) => sc.ownerId === userId);
    if (!activeInvite) throw new Error("No active invite found");

    await ctx.db.patch(activeInvite._id, { isActive: false });

    return { success: true };
  },
});

export const joinByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!sharedChat) throw new Error("Invalid invite link");
    if (!sharedChat.isActive) throw new Error("This invite is no longer active");
    if (sharedChat.ownerId === userId) throw new Error("You cannot join your own invite");

    if (sharedChat.invitedUserIds.includes(userId)) {
      return { threadId: sharedChat.threadId };
    }

    await ctx.db.patch(sharedChat._id, {
      invitedUserIds: [...sharedChat.invitedUserIds, userId],
    });

    // Notify the thread owner that someone joined
    const user = await ctx.db.get(userId);
    const joinerName = user?.name || user?.email || "Someone";
    await ctx.db.insert("notifications", {
      userId: sharedChat.ownerId,
      type: "share",
      title: "User joined your thread",
      body: `${joinerName} joined your shared thread`,
      read: false,
      metadata: { threadId: sharedChat.threadId },
      createdAt: new Date().toISOString(),
    });

    // Notify existing participants (excluding the new joiner and owner)
    for (const participantId of sharedChat.invitedUserIds) {
      if (participantId === userId || participantId === sharedChat.ownerId) continue;
      await ctx.db.insert("notifications", {
        userId: participantId,
        type: "share",
        title: "New collaborator",
        body: `${joinerName} joined a shared thread`,
        read: false,
        metadata: { threadId: sharedChat.threadId },
        createdAt: new Date().toISOString(),
      });
    }

    return { threadId: sharedChat.threadId };
  },
});

export const getInviteByThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const invites = await ctx.db
      .query("sharedChats")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq("isActive", true as any))
      .collect();

    const activeInvite = invites.find((sc) => sc.ownerId === userId);
    if (!activeInvite) return null;

    return {
      token: activeInvite.token,
      isActive: activeInvite.isActive,
      invitedUserIds: activeInvite.invitedUserIds,
      createdAt: activeInvite.createdAt,
    };
  },
});

export const getSharedParticipants = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq("isActive", true as any))
      .first();

    if (!sharedChat || sharedChat.invitedUserIds.length === 0) return [];

    const participants = await Promise.all(
      sharedChat.invitedUserIds.map(async (uid) => {
        const user = await ctx.db.get(uid);
        return {
          userId: uid,
          email: user?.email ?? "",
          name: user?.name ?? "",
        };
      }),
    );

    return participants;
  },
});
