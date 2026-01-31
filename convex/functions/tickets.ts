import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

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
  v.literal("reopened"),
);

// create new ticket
export const create = mutation({
  args: {
    customerId: v.id("users"),
    vendorId: v.id("vendors"),
    channel: v.union(
      v.literal("chat"),
      v.literal("call"),
      v.literal("email"),
      v.literal("docs"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    subject: v.string(),
    // Optional intake form fields
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    severity: v.optional(v.string()),
    urgency: v.optional(v.string()),
    preferredContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("tickets", {
      ...args,
      status: "created",
      currentSupportLevel: "L1",
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, ticketId: id };
  },
});

// create ticket from intake form with auto-routing
export const createFromIntake = mutation({
  args: {
    customerId: v.id("users"),
    vendorId: v.id("vendors"),
    subject: v.string(),
    description: v.string(),
    category: v.string(),
    severity: v.string(),
    urgency: v.string(),
    preferredContact: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Determine priority based on severity + urgency
    let priority: "low" | "medium" | "high" | "urgent" = "medium";
    if (args.severity === "critical" || args.urgency === "immediate") {
      priority = "urgent";
    } else if (args.severity === "major" || args.urgency === "high") {
      priority = "high";
    } else if (args.severity === "minor" && args.urgency === "low") {
      priority = "low";
    }

    // Map preferred contact to channel
    const channelMap: Record<string, "chat" | "call" | "email"> = {
      chat: "chat",
      call: "call",
      email: "email",
    };
    const channel = channelMap[args.preferredContact] || "chat";

    // Create the ticket
    const ticketId = await ctx.db.insert("tickets", {
      customerId: args.customerId,
      vendorId: args.vendorId,
      status: "waiting_for_agent",
      channel,
      priority,
      subject: args.subject,
      description: args.description,
      category: args.category,
      severity: args.severity,
      urgency: args.urgency,
      preferredContact: args.preferredContact,
      currentSupportLevel: "L1",
      createdAt: now,
      updatedAt: now,
    });

    // Create initial conversation
    const conversationId = await ctx.db.insert("conversations", {
      ticketId,
      channel,
      createdAt: now,
    });

    // Add the initial message from customer
    await ctx.db.insert("messages", {
      conversationId,
      senderId: args.customerId,
      senderType: "customer",
      content: args.description,
      createdAt: now,
    });

    // Add to queue for routing
    await ctx.db.insert("queues", {
      vendorId: args.vendorId,
      ticketId,
      priority:
        priority === "urgent"
          ? 4
          : priority === "high"
            ? 3
            : priority === "medium"
              ? 2
              : 1,
      enteredAt: now,
    });

    return { success: true, ticketId };
  },
});

// get ticket by id
export const get = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ticketId);
  },
});

// list tickets for customer
export const listByCustomer = query({
  args: { customerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
  },
});

// list tickets for vendor (rep inbox)
export const listByVendor = query({
  args: {
    vendorId: v.id("vendors"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("tickets")
      .withIndex("by_vendor", (qb) => qb.eq("vendorId", args.vendorId));

    if (args.status) {
      q = q.filter((qb) => qb.eq(qb.field("status"), args.status));
    }
    return await q.order("desc").collect();
  },
});

// list tickets assigned to rep
export const listByRep = query({
  args: { repId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_rep", (q) => q.eq("assignedRepId", args.repId))
      .order("desc")
      .collect();
  },
});

// update ticket status
export const updateStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.status === "resolved") updates.resolvedAt = Date.now();
    if (args.status === "closed") updates.closedAt = Date.now();

    await ctx.db.patch(args.ticketId, updates);
    return { success: true };
  },
});

// assign ticket to rep
export const assign = mutation({
  args: {
    ticketId: v.id("tickets"),
    repId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      assignedRepId: args.repId,
      status: "assigned",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// escalate ticket
export const escalate = mutation({
  args: {
    ticketId: v.id("tickets"),
    repId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    // determine current and next support level
    const currentLevel = ticket.currentSupportLevel || "L1";
    let nextLevel: "L2" | "L3";

    if (currentLevel === "L1") {
      nextLevel = "L2";
    } else if (currentLevel === "L2") {
      nextLevel = "L3";
    } else {
      throw new Error("Cannot escalate beyond L3");
    }

    const now = Date.now();

    // update ticket with escalation
    await ctx.db.patch(args.ticketId, {
      status: "escalated",
      currentSupportLevel: nextLevel,
      assignedRepId: undefined,
      escalatedFrom: args.repId,
      escalatedAt: now,
      updatedAt: now,
    });

    // add system message to conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .first();

    if (conversation) {
      const rep = await ctx.db.get(args.repId);
      await ctx.db.insert("messages", {
        conversationId: conversation._id,
        senderType: "system",
        content: `Ticket escalated from ${currentLevel} to ${nextLevel} by ${rep?.name || "representative"}`,
        createdAt: now,
      });
    }

    return { success: true, nextLevel };
  },
});

// reassign ticket
export const reassign = mutation({
  args: {
    ticketId: v.id("tickets"),
    newRepId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      status: "reassigned",
      assignedRepId: args.newRepId,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// list active tickets for customer (non-closed)
export const listActive = query({
  args: { customerId: v.id("users") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
    return tickets.filter((t) => t.status !== "closed");
  },
});

// list unassigned tickets for rep queue with level-based filtering
export const listUnassigned = query({
  args: {
    vendorId: v.optional(v.id("vendors")),
    channel: v.optional(
      v.union(
        v.literal("chat"),
        v.literal("call"),
        v.literal("email"),
        v.literal("docs"),
      )
    ),
    repRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tickets;
    if (args.vendorId) {
      const vid = args.vendorId;
      tickets = await ctx.db
        .query("tickets")
        .withIndex("by_vendor", (qb) => qb.eq("vendorId", vid))
        .order("desc")
        .collect();
    } else {
      tickets = await ctx.db.query("tickets").order("desc").collect();
    }

    let filtered = tickets.filter((t) => !t.assignedRepId && t.status !== "closed");

    if (args.channel) {
      filtered = filtered.filter((t) => t.channel === args.channel);
    }

    // filter based on rep support level
    if (args.repRole) {
      if (args.repRole === "rep_l1") {
        // L1 reps see tickets without a level or explicitly L1
        filtered = filtered.filter((t) => !t.currentSupportLevel || t.currentSupportLevel === "L1");
      } else if (args.repRole === "rep_l2") {
        // L2 reps see only L2 escalated tickets
        filtered = filtered.filter((t) => t.currentSupportLevel === "L2");
      } else if (args.repRole === "rep_l3") {
        // L3 reps see only L3 escalated tickets
        filtered = filtered.filter((t) => t.currentSupportLevel === "L3");
      }
    }

    return filtered;
  },
});

// get ticket with customer and vendor details
export const getWithDetails = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return null;

    const customer = await ctx.db.get(ticket.customerId);
    const vendor = await ctx.db.get(ticket.vendorId);
    const rep = ticket.assignedRepId
      ? await ctx.db.get(ticket.assignedRepId)
      : null;

    return { ...ticket, customer, vendor, rep };
  },
});

// list tickets for a specific vendor and customer
export const listByVendorAndCustomer = query({
  args: {
    vendorId: v.id("vendors"),
    customerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
    return tickets.filter((t) => t.vendorId === args.vendorId);
  },
});

// update ticket details (subject, priority, description, category, etc.)
export const updateDetails = mutation({
  args: {
    ticketId: v.id("tickets"),
    subject: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    )),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    severity: v.optional(v.string()),
    urgency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.subject !== undefined) updates.subject = args.subject;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.severity !== undefined) updates.severity = args.severity;
    if (args.urgency !== undefined) updates.urgency = args.urgency;

    await ctx.db.patch(args.ticketId, updates);
    return { success: true };
  },
});
