/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { query } from "./_generated/server";

export const me = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      email: identity.email ?? "",
      name: identity.name ?? identity.email ?? "",
    };
  },
});