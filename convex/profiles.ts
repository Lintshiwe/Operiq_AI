/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Returns the profile for the current authenticated user.
 * Auto-creates a profile on first access using the auth identity email as display name.
 */
export const getProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Try to find existing profile
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return existing ?? null;
  },
});

/**
 * Update the current user's profile display name.
 */
export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find existing profile
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existing) {
      // Create profile if it doesn't exist yet
      const identity = await ctx.auth.getUserIdentity();
      const name = args.displayName ?? identity?.name ?? identity?.email ?? "User";
      const id = await ctx.db.insert("profiles", {
        userId,
        displayName: name,
        createdAt: new Date().toISOString(),
      });
      return { success: true, profileId: id };
    }

    const patch: Record<string, string> = {};
    if (args.displayName !== undefined) {
      patch.displayName = args.displayName;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(existing._id, patch);
    }

    return { success: true };
  },
});
