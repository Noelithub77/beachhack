import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  restaurants: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    currency: v.string(), // e.g., "INR", "USD"
    logoStorageId: v.optional(v.id("_storage")),
    gstEnabled: v.optional(v.boolean()),
    gstPercentage: v.optional(v.number()),
    gstNumber: v.optional(v.string()),
  }),

  staff: defineTable({
    email: v.string(),
    restaurantId: v.id("restaurants"),
    role: v.union(v.literal("admin"), v.literal("staff")),
    subrole: v.optional(v.union(v.literal("waiter"), v.literal("kitchen"), v.literal("cashier"))),
    name: v.string(),
    isActive: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_restaurant", ["restaurantId"]),

  menuCategories: defineTable({
    name: v.string(),
    restaurantId: v.id("restaurants"),
    order: v.number(),
  }).index("by_restaurant", ["restaurantId"]),

  menuItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("menuCategories"),
    restaurantId: v.id("restaurants"),
    imageUrl: v.optional(v.string()), // Legacy URL support
    imageStorageId: v.optional(v.id("_storage")),
    isAvailable: v.boolean(),
    type: v.union(v.literal("veg"), v.literal("non-veg")),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["categoryId"]),

  tables: defineTable({
    number: v.number(),
    label: v.string(),
    restaurantId: v.id("restaurants"),
    status: v.union(v.literal("active"), v.literal("inactive")),
  }).index("by_restaurant", ["restaurantId"]),

  orders: defineTable({
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    items: v.string(),
    totalAmount: v.number(),
    customerName: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    preparingAt: v.optional(v.number()),
    readyAt: v.optional(v.number()),
    servedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    orderNumber: v.optional(v.number()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_table", ["tableId"])
    .index("by_restaurant_created", ["restaurantId", "createdAt"]),
});
