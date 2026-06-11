/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  threads: defineTable({
    userId: v.id("users"),
    title: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.string(),
        content: v.string(),
        createdAt: v.optional(v.string()),
      }),
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

  emailDrafts: defineTable({
    userId: v.id("users"),
    recipient: v.optional(v.string()),
    subject: v.optional(v.string()),
    tone: v.string(),
    audience: v.string(),
    context: v.optional(v.string()),
    draft: v.string(),
    sent: v.boolean(),
    sentAt: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  meetingSummaries: defineTable({
    userId: v.id("users"),
    meetingType: v.optional(v.string()),
    notes: v.string(),
    output: v.string(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  taskPlans: defineTable({
    userId: v.id("users"),
    horizon: v.string(),
    tasks: v.string(),
    goals: v.optional(v.string()),
    output: v.string(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  researchAnalyses: defineTable({
    userId: v.id("users"),
    material: v.string(),
    question: v.optional(v.string()),
    depth: v.optional(v.string()),
    output: v.string(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  sharedChats: defineTable({
    threadId: v.id("threads"),
    ownerId: v.id("users"),
    token: v.string(),
    isActive: v.boolean(),
    createdAt: v.string(),
    invitedUserIds: v.array(v.id("users")),
  })
    .index("by_token", ["token"])
    .index("by_threadId", ["threadId"]),

  billing: defineTable({
    userId: v.id("users"),
    plan: v.string(),
    aiRequestsUsed: v.number(),
    aiRequestsLimit: v.number(),
    imagesGenerated: v.number(),
    imagesLimit: v.number(),
    storageUsed: v.number(),
    storageLimit: v.number(),
    subscriptionStatus: v.string(),
    currentPeriodStart: v.string(),
    currentPeriodEnd: v.string(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),
});