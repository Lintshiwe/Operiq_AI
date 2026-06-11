/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existing) return existing;
    
    // Auto-create profile with displayName from identity email
    const identity = await ctx.auth.getUserIdentity();
    const displayName = identity?.name ?? identity?.email ?? "User";
    
    const id = await ctx.db.insert("profiles", {
      userId,
      displayName,
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
    });
    
    return await ctx.db.get(id);
  },
});

export const updateProfile = mutation({
  args: { displayName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!existing) {
      // Auto-create
      const identity = await ctx.auth.getUserIdentity();
      const displayName = args.displayName ?? identity?.name ?? identity?.email ?? "User";
      const id = await ctx.db.insert("profiles", {
        userId,
        displayName,
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
      });
      return await ctx.db.get(id);
    }
    
    const patch: Record<string, unknown> = {};
    if (args.displayName !== undefined) patch.displayName = args.displayName;
    if (Object.keys(patch).length === 0) return existing;
    
    await ctx.db.patch(existing._id, patch);
    return await ctx.db.get(existing._id);
  },
});

export const updateAvatar = mutation({
  args: { avatarUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!existing) {
      const identity = await ctx.auth.getUserIdentity();
      const displayName = identity?.name ?? identity?.email ?? "User";
      const id = await ctx.db.insert("profiles", {
        userId,
        displayName,
        avatarUrl: args.avatarUrl,
        createdAt: new Date().toISOString(),
      });
      return await ctx.db.get(id);
    }
    
    await ctx.db.patch(existing._id, { avatarUrl: args.avatarUrl });
    return await ctx.db.get(existing._id);
  },
});
