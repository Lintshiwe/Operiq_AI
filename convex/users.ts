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
    const user = await ctx.db.get(userId);
    const identity = await ctx.auth.getUserIdentity();
    
    // Try to get profile
    let profile = null;
    try {
      profile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
    } catch {
      // profiles table might not exist yet
    }
    
    return {
      _id: userId,
      email: identity?.email ?? user?.email ?? "",
      name: profile?.displayName ?? identity?.name ?? identity?.email ?? "",
      displayName: profile?.displayName ?? identity?.name ?? identity?.email ?? "",
      ...(profile?.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
      ...(user?.image ? { image: user.image } : {}),
    };
  },
});

// Deprecated: use profiles.updateProfile instead
export const updateProfile = mutation({
  args: { name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // This patches the users table but profile data is now in profiles table
    // For backward compatibility, still patch users table if it has name field
    const patch: Record<string, string> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (Object.keys(patch).length === 0) return { success: true };
    try {
      await ctx.db.patch(userId, patch);
    } catch {
      // Silently fail if users table doesn't have name field
    }
    return { success: true };
  },
});
