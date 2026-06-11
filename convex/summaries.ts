/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { callAI } from "./ai";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meetingSummaries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const generate = mutation({
  args: {
    meetingType: v.optional(v.string()),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const system = `You analyze raw meeting notes/transcripts and produce a clear executive briefing.
Meeting type: ${args.meetingType || "general"}. Return markdown with exactly these sections in this order:
## Summary
A 3-5 sentence neutral synopsis.
## Key Decisions
Bulleted list of decisions made.
## Action Items
Bulleted list — each line: **Owner** — task — due date (if mentioned).
## Deadlines
Bulleted list of dates and what is due.
If a section has nothing, write "_None identified_".
Be thorough and accurate. Flag any ambiguous points.`;

    const prompt = `Analyze these meeting notes and produce an executive briefing:\n\n${args.notes}`;

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey || !baseUrl) throw new Error("AI configuration missing");

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) throw new Error(`AI generation failed: ${res.status}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    await ctx.db.insert("meetingSummaries", {
      userId,
      meetingType: args.meetingType,
      notes: args.notes,
      output: text,
      createdAt: new Date().toISOString(),
    });

    return { text };
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    meetingType: v.optional(v.string()),
    notes: v.string(),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetingSummaries", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const generateSummary = mutation({
  args: {
    meetingType: v.optional(v.string()),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const meetingTypeInfo = args.meetingType
      ? `Meeting type: ${args.meetingType}`
      : "General meeting";

    const systemPrompt = `You are an expert meeting analyst. Summarize meeting notes into clear, actionable formats.

For each summary:
1. Extract key decisions made
2. List action items with owners (if mentioned)
3. Identify important deadlines
4. Note any open questions or follow-ups
5. Keep the summary concise and scannable

${meetingTypeInfo}`;

    const userPrompt = `Please summarize these meeting notes:\n\n${args.notes}`;

    const output = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Save to database
    const id = await ctx.db.insert("meetingSummaries", {
      userId,
      meetingType: args.meetingType,
      notes: args.notes,
      output,
      createdAt: new Date().toISOString(),
    });

    return { success: true, summaryId: id, output };
  },
});