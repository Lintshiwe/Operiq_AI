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
    return {
      _id: userId,
      email: identity?.email ?? user?.email ?? "",
      name: identity?.name ?? user?.name ?? identity?.email ?? "",
      ...(user?.image ? { image: user.image } : {}),
    };
  },
});

export const updateProfile = mutation({
  args: { name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const patch: Record<string, string> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (Object.keys(patch).length === 0) return { success: true };
    await ctx.db.patch(userId, patch);
    return { success: true };
  },
});
