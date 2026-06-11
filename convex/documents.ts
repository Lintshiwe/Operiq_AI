/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ------------------------------------------------------------------ */
/*  Queries                                                           */
/* ------------------------------------------------------------------ */

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) return null;

    return doc;
  },
});

/* ------------------------------------------------------------------ */
/*  Mutations                                                         */
/* ------------------------------------------------------------------ */

export const upload = mutation({
  args: {
    filename: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate AI summary
    let summary: string | undefined;
    try {
      summary = await generateSummary(args.content);
    } catch (err) {
      console.warn("Failed to generate document summary:", err);
      // Continue without summary — it's optional
    }

    const docId = await ctx.db.insert("documents", {
      userId,
      filename: args.filename,
      content: args.content,
      summary,
      createdAt: new Date().toISOString(),
    });

    return { documentId: docId, summary: summary ?? null };
  },
});

/* ------------------------------------------------------------------ */
/*  Internal — Document Summarization                                 */
/* ------------------------------------------------------------------ */

async function generateSummary(content: string): Promise<string> {
  const truncated = content.length > 12000 ? content.slice(0, 12000) + "\n\n[...truncated]" : content;

  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey || !baseUrl) throw new Error("AI configuration missing");

  const system = `You are a document summarization assistant. Given the text of a document,
produce a concise summary with these sections in markdown:

## TL;DR
One sentence capturing the essence.

## Key Points
3-5 bullet points of the most important information.

## Actionable Insights
1-3 numbered recommendations or next steps based on the document.

Keep the summary professional and neutral. Flag any ambiguities or missing context.`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Summarize this document:\n\n${truncated}` },
      ],
    }),
  });

  if (!res.ok) throw new Error(`AI generation failed: ${res.status}`);

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? "No summary generated.";
}
