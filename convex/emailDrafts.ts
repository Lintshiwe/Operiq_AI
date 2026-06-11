/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { callAI } from "./ai";

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

export const generate = action({
  args: {
    recipient: v.string(),
    subject: v.string(),
    tone: v.string(),
    audience: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as any;
    if (!userId) throw new Error("Not authenticated");

    const systemPrompt = `You are an expert email copywriter for professionals. 
Write emails that are clear, concise, and appropriate for the workplace.

Guidelines:
- Use a professional ${args.tone} tone
- Target audience: ${args.audience}
- Keep it concise but complete
- Include appropriate greeting and signature
- Subject line should be clear and descriptive
- Do not use placeholder text like [Your Name] — use a professional sign-off`;

    const userPrompt = `Write an email with the following details:

To: ${args.recipient}
Subject: ${args.subject}
Tone: ${args.tone}
Audience: ${args.audience}${args.context ? `\nAdditional context: ${args.context}` : ""}

Please write the complete email draft.`;

    const draft = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Save to database
    const draftId = await ctx.db.insert("emailDrafts", {
      userId,
      recipient: args.recipient,
      subject: args.subject,
      tone: args.tone,
      audience: args.audience,
      context: args.context,
      draft,
      sent: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, draftId, draft };
  },
});