import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailDrafts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    recipient: v.optional(v.string()),
    subject: v.optional(v.string()),
    tone: v.string(),
    audience: v.string(),
    context: v.optional(v.string()),
    draft: v.string(),
    sent: v.boolean(),
    sentAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailDrafts", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const markSent = mutation({
  args: { draftId: v.id("emailDrafts"), sentAt: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.draftId, { sent: true, sentAt: args.sentAt });
  },
});
