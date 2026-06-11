/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const me = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const identity = await ctx.auth.getUserIdentity();

    // Read profile data from the profiles table
    let profile = null;
    try {
      profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
    } catch {
      // profiles table might not be deployed yet
    }

    return {
      _id: userId,
      email: identity?.email ?? "",
      name: profile?.displayName ?? identity?.name ?? identity?.email ?? "",
      displayName: profile?.displayName ?? identity?.name ?? identity?.email ?? "",
      ...(profile?.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
    };
  },
});

export const deleteAccount = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete user's threads
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const t of threads) await ctx.db.delete(t._id);

    // Delete user's profiles
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const p of profiles) await ctx.db.delete(p._id);

    // Delete user's billing
    const billingRecords = await ctx.db
      .query("billing")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const b of billingRecords) await ctx.db.delete(b._id);

    // Delete user's documents
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const d of documents) await ctx.db.delete(d._id);

    // Delete user's sharedChats
    const sharedChats = await ctx.db
      .query("sharedChats")
      .withIndex("by_threadId", (q) => q.eq("threadId", userId))
      .collect();
    for (const s of sharedChats) await ctx.db.delete(s._id);

    // Delete sharedChats where user is the owner
    const ownedChats = await ctx.db
      .query("sharedChats")
      .filter((q) => q.eq("ownerId", userId))
      .collect();
    for (const s of ownedChats) await ctx.db.delete(s._id);

    // Delete user's email drafts
    const emailDrafts = await ctx.db
      .query("emailDrafts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const e of emailDrafts) await ctx.db.delete(e._id);

    // Delete user's meeting summaries
    const meetingSummaries = await ctx.db
      .query("meetingSummaries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const m of meetingSummaries) await ctx.db.delete(m._id);

    // Delete user's task plans
    const taskPlans = await ctx.db
      .query("taskPlans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const p of taskPlans) await ctx.db.delete(p._id);

    // Delete user's research analyses
    const researchAnalyses = await ctx.db
      .query("researchAnalyses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const r of researchAnalyses) await ctx.db.delete(r._id);

    // Delete user's notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const n of notifications) await ctx.db.delete(n._id);

    // Delete user's presence records
    const presenceRecords = await ctx.db
      .query("presence")
      .withIndex("by_user_thread", (q) => q.eq("userId", userId))
      .collect();
    for (const p of presenceRecords) await ctx.db.delete(p._id);

    // Delete user's API keys
    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const k of apiKeys) await ctx.db.delete(k._id);

    // Delete user's prompts (if they exist)
    try {
      const prompts = await ctx.db
        .query("prompts")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      for (const p of prompts) await ctx.db.delete(p._id);
    } catch {
      // prompts table might not exist yet
    }

    // Finally delete the user document itself
    await ctx.db.delete(userId);

    return { success: true };
  },
});
