import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// enums
const userRole = v.union(
  v.literal("customer"),
  v.literal("rep_l1"),
  v.literal("rep_l2"),
  v.literal("rep_l3"),
  v.literal("admin_manager"),
  v.literal("admin_senior"),
  v.literal("admin_super")
);

const ticketStatus = v.union(
  v.literal("created"),
  v.literal("intake_in_progress"),
  v.literal("waiting_for_agent"),
  v.literal("assigned"),
  v.literal("in_progress"),
  v.literal("reassigned"),
  v.literal("escalated"),
  v.literal("resolved"),
  v.literal("closed"),
  v.literal("reopened")
);

const channel = v.union(
  v.literal("chat"),
  v.literal("call"),
  v.literal("email"),
  v.literal("docs")
);

const priority = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent")
);

export default defineSchema({
  // users with role-based access
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: userRole,
    vendorId: v.optional(v.id("vendors")),
    language: v.string(),
    avatarUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_vendor", ["vendorId"]),

  // multi-vendor support
  vendors: defineTable({
    name: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    primaryColor: v.optional(v.string()),
    category: v.optional(v.string()), // e.g., "Technology", "Finance", "Healthcare"
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    supportPhone: v.optional(v.string()),
    slaResponseHours: v.optional(v.number()),
    contractStartDate: v.optional(v.number()),
    contractEndDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  // user favorites for vendors
  userFavorites: defineTable({
    userId: v.id("users"),
    vendorId: v.id("vendors"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_vendor", ["userId", "vendorId"]),

  // core ticket entity
  tickets: defineTable({
    customerId: v.id("users"),
    vendorId: v.id("vendors"),
    assignedRepId: v.optional(v.id("users")),
    status: ticketStatus,
    channel: channel,
    priority: priority,
    subject: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
  })
    .index("by_customer", ["customerId"])
    .index("by_vendor", ["vendorId"])
    .index("by_rep", ["assignedRepId"])
    .index("by_status", ["status"])
    .index("by_vendor_status", ["vendorId", "status"]),

  // chat/email threads
  conversations: defineTable({
    ticketId: v.id("tickets"),
    channel: channel,
    createdAt: v.number(),
  }).index("by_ticket", ["ticketId"]),

  // individual messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.optional(v.id("users")),
    senderType: v.union(v.literal("customer"), v.literal("rep"), v.literal("ai"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  // voice call sessions
  callSessions: defineTable({
    ticketId: v.id("tickets"),
    callerId: v.id("users"),
    receiverId: v.optional(v.id("users")),
    twilioSid: v.optional(v.string()),
    status: v.union(v.literal("ringing"), v.literal("in_progress"), v.literal("ended")),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    recordingUrl: v.optional(v.string()),
  })
    .index("by_ticket", ["ticketId"])
    .index("by_caller", ["callerId"]),

  // live transcription
  transcripts: defineTable({
    callSessionId: v.id("callSessions"),
    speakerId: v.optional(v.id("users")),
    speakerType: v.union(v.literal("customer"), v.literal("rep"), v.literal("ai")),
    text: v.string(),
    timestamp: v.number(),
  }).index("by_call", ["callSessionId"]),

  // AI-curated context
  contextSummaries: defineTable({
    ticketId: v.id("tickets"),
    summary: v.string(),
    confirmedFacts: v.array(v.string()),
    inferredSignals: v.array(v.string()),
    unknowns: v.array(v.string()),
    actionsTaken: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_ticket", ["ticketId"]),

  // intelligent routing
  queues: defineTable({
    vendorId: v.id("vendors"),
    ticketId: v.id("tickets"),
    priority: v.number(),
    enteredAt: v.number(),
    estimatedWaitMinutes: v.optional(v.number()),
  })
    .index("by_vendor", ["vendorId"])
    .index("by_priority", ["priority"]),

  // customer feedback
  feedback: defineTable({
    ticketId: v.id("tickets"),
    customerId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_ticket", ["ticketId"]),

  // internal tasks
  tasks: defineTable({
    vendorId: v.id("vendors"),
    assigneeId: v.id("users"),
    createdById: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
    dueAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_assignee", ["assigneeId"])
    .index("by_vendor", ["vendorId"]),

  // calendar/scheduling
  calendarEvents: defineTable({
    vendorId: v.id("vendors"),
    userId: v.id("users"),
    title: v.string(),
    type: v.union(v.literal("shift"), v.literal("meeting"), v.literal("other")),
    startAt: v.number(),
    endAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_vendor", ["vendorId"]),
});
