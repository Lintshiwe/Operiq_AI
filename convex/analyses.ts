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
      .query("researchAnalyses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const generate = mutation({
  args: {
    material: v.string(),
    question: v.optional(v.string()),
    depth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const system = `You are a senior research analyst. Distill the provided material.
Analysis depth: ${args.depth || "deep"}. Return markdown with:
## Executive Summary
3-5 sentences.
## Key Insights
Bulleted list of the most important findings.
## Recommendations
Numbered, actionable, written for decision-makers.
## Open Questions
Bulleted list of gaps or items needing verification.
Be objective. Flag potential biases in the source material.`;

    const userPromptParts: string[] = [`Material:\n${args.material}`];
    if (args.question) userPromptParts.push(`Question: ${args.question}`);
    const prompt = `Analyze the following material${args.question ? ", addressing the specific question" : ""}:\n\n${userPromptParts.join("\n\n")}`;

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

    await ctx.db.insert("researchAnalyses", {
      userId,
      material: args.material,
      question: args.question,
      depth: args.depth,
      output: text,
      createdAt: new Date().toISOString(),
    });

    return { text };
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    material: v.string(),
    question: v.optional(v.string()),
    depth: v.optional(v.string()),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchAnalyses", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const generateAnalysis = mutation({
  args: {
    material: v.string(),
    question: v.optional(v.string()),
    depth: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const depthLabel = args.depth ?? "quick";
    const depthInstructions: Record<string, string> = {
      quick: "Provide a brief, high-level overview. Keep it to key points only.",
      deep: "Provide a thorough, detailed analysis. Go into depth on key topics.",
      executive: "Provide a concise executive summary with key takeaways and recommendations. Focus on business impact.",
    };

    const systemPrompt = `You are an expert research analyst. Analyze materials and provide insightful, well-structured analyses.

Analysis depth: ${depthLabel}
${depthInstructions[depthLabel] || depthInstructions.quick}

Format your analysis with:
- Clear headings
- Key findings
- Supporting evidence
- Recommendations (if applicable)
- Sources or references (if mentioned in materials)`;

    const userPrompt = `Analyze the following material${args.question ? ` with this question in mind: ${args.question}` : ""}:\n\n${args.material}`;

    const output = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Save to database
    const id = await ctx.db.insert("researchAnalyses", {
      userId,
      material: args.material,
      question: args.question,
      depth: args.depth,
      output,
      createdAt: new Date().toISOString(),
    });

    return { success: true, analysisId: id, output };
  },
});