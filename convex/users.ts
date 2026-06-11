/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
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
