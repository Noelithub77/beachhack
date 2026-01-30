import { internalMutation, action } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";

type ResetResult = {
  success: boolean;
  message: string;
};

export const resetDatabase = internalMutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    try {
      // Delete all data from each table in order of dependencies
      const tables = [
        // "orders",
        // "orderItems",
        // "sessions",
        "users",
        // "tables",
        // "menuItems",
        // "menuCategories",
        // "staff",
        // "restaurants",
      ];

      for (const table of tables) {
        const docs = await ctx.db.query(table as any).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      }

      return {
        success: true,
        message: "Database reset successfully",
      };
    } catch (error) {
      console.error("Database reset failed:", error);
      return {
        success: false,
        message: `Database reset failed: ${error}`,
      };
    }
  },
});

export const resetAuthDatabase = internalMutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    try {
      // Delete Better Auth tables
      const authTables = [
        "accounts",
        "sessions",
        "users",
        "verifications",
      ];

      for (const table of authTables) {
        const docs = await ctx.db.query(table as any).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      }

      return {
        success: true,
        message: "Auth database reset successfully",
      };
    } catch (error) {
      console.error("Auth database reset failed:", error);
      return {
        success: false,
        message: `Auth database reset failed: ${error}`,
      };
    }
  },
});

export const resetEverything = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx): Promise<ResetResult> => {
    try {
      // Reset Convex application database
      const appResult: ResetResult = await ctx.runMutation(internal.functions.manage.reset.resetDatabase);
      
      if (!appResult.success) {
        return appResult;
      }

      // Reset Better Auth database
      const authResult: ResetResult = await ctx.runMutation(internal.functions.manage.reset.resetAuthDatabase);
      
      if (!authResult.success) {
        return authResult;
      }

      return {
        success: true,
        message: "All databases reset successfully",
      };
    } catch (error) {
      console.error("Complete reset failed:", error);
      return {
        success: false,
        message: `Complete reset failed: ${error}`,
      };
    }
  },
});
