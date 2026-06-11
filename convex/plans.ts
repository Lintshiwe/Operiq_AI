/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("taskPlans")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const generate = mutation({
  args: {
    horizon: v.string(),
    tasks: v.string(),
    goals: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const system = `You are an executive productivity coach. Build a prioritized ${args.horizon} plan.
Return markdown with:
## Prioritized Plan
A numbered schedule (with suggested time blocks for daily; day-by-day for weekly).
Mark each item P1 / P2 / P3.
## Rationale
Briefly explain prioritization (Eisenhower / impact-effort lens).
## Productivity Suggestions
3 concrete improvements tailored to the workload.
Consider dependencies between tasks and energy levels.`;

    const userPromptParts: string[] = [`Tasks:\n${args.tasks}`];
    if (args.goals) userPromptParts.push(`Goals: ${args.goals}`);
    const prompt = `Build a prioritized ${args.horizon} plan for the following workload:\n\n${userPromptParts.join("\n\n")}`;

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

    await ctx.db.insert("taskPlans", {
      userId,
      horizon: args.horizon,
      tasks: args.tasks,
      goals: args.goals,
      output: text,
      createdAt: new Date().toISOString(),
    });

    return { text };
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    horizon: v.string(),
    tasks: v.string(),
    goals: v.optional(v.string()),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("taskPlans", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});


