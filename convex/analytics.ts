/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * Analytics queries that aggregate usage data across tables.
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ------------------------------------------------------------------ */
/*  Usage Stats                                                        */
/* ------------------------------------------------------------------ */

export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Total AI requests this month (from billing)
    const billing = await ctx.db
      .query("billing")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    // Total threads created by user (all-time, plus this month)
    const userThreads = await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Total documents uploaded by user
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Threads this month
    const threadsThisMonth = userThreads.filter(
      (t) => t.createdAt >= monthStart,
    ).length;

    // Documents this month
    const docsThisMonth = documents.filter(
      (d) => d.createdAt >= monthStart,
    ).length;

    // Daily breakdown for last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const dailyBreakdown: Array<{ date: string; threads: number; documents: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = day.toISOString().slice(0, 10);
      const nextDayStr = new Date(day.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const threadsOnDay = userThreads.filter(
        (t) => t.createdAt.slice(0, 10) === dayStr,
      ).length;
      const docsOnDay = documents.filter(
        (d) => d.createdAt.slice(0, 10) === dayStr,
      ).length;

      dailyBreakdown.push({
        date: dayStr,
        threads: threadsOnDay,
        documents: docsOnDay,
      });
    }

    // Most used feature (heuristic based on table counts)
    const researchCount = (
      await ctx.db
        .query("researchAnalyses")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect()
    ).length;
    const meetingCount = (
      await ctx.db
        .query("meetingSummaries")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect()
    ).length;
    const planCount = (
      await ctx.db
        .query("taskPlans")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect()
    ).length;
    const draftCount = (
      await ctx.db
        .query("emailDrafts")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect()
    ).length;

    const featureCounts: Record<string, number> = {
      "AI Chat": userThreads.length,
      "Research": researchCount,
      "Meetings": meetingCount,
      "Planner": planCount,
      "Email Drafts": draftCount,
      "Documents": documents.length,
    };

    let mostUsed = "AI Chat";
    let maxCount = 0;
    for (const [feature, count] of Object.entries(featureCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = feature;
      }
    }

    return {
      aiRequestsThisMonth: billing?.aiRequestsUsed ?? 0,
      imagesGenerated: billing?.imagesGenerated ?? 0,
      totalThreads: userThreads.length,
      threadsThisMonth,
      totalDocuments: documents.length,
      documentsThisMonth: docsThisMonth,
      mostUsedFeature: mostUsed,
      dailyBreakdown,
      plan: billing?.plan ?? "free",
      aiRequestsLimit: billing?.aiRequestsLimit ?? 50,
    };
  },
});

/* ------------------------------------------------------------------ */
/*  Activity Log                                                       */
/* ------------------------------------------------------------------ */

export const getActivityLog = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const activities: Array<{
      type: string;
      title: string;
      timestamp: string;
      details?: string;
    }> = [];

    // Threads
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    for (const t of threads) {
      activities.push({
        type: "thread",
        title: `Created thread: ${t.title}`,
        timestamp: t.createdAt,
        details: `${t.messages.length} messages`,
      });
    }

    // Documents
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    for (const d of docs) {
      activities.push({
        type: "document",
        title: `Uploaded document: ${d.filename}`,
        timestamp: d.createdAt,
        details: d.summary ? "Summarized" : undefined,
      });
    }

    // Research analyses
    const analyses = await ctx.db
      .query("researchAnalyses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    for (const a of analyses) {
      activities.push({
        type: "research",
        title: "Research analysis generated",
        timestamp: a.createdAt,
        details: a.depth ?
          `Depth: ${a.depth}` :
          undefined,
      });
    }

    // Meeting summaries
    const meetings = await ctx.db
      .query("meetingSummaries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    for (const m of meetings) {
      activities.push({
        type: "meeting",
        title: `Meeting summary: ${m.meetingType ?? "General"}`,
        timestamp: m.createdAt,
      });
    }

    // Task plans
    const plans = await ctx.db
      .query("taskPlans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    for (const p of plans) {
      activities.push({
        type: "plan",
        title: `Plan created: ${p.horizon}`,
        timestamp: p.createdAt,
      });
    }

    // Email drafts
    const drafts = await ctx.db
      .query("emailDrafts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    for (const d of drafts) {
      activities.push({
        type: "email",
        title: `Email draft: ${d.subject ?? "Untitled"}`,
        timestamp: d.createdAt,
        details: d.sent ? "Sent" : "Draft",
      });
    }

    // Sort by timestamp descending, take top 50
    activities.sort(
      (a, b) => b.timestamp.localeCompare(a.timestamp),
    );

    return activities.slice(0, 50);
  },
});
