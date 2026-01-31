import { internalMutation, action } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";

type ResetResult = {
  success: boolean;
  message: string;
  totalDeleted: number;
};

export const resetDatabase = internalMutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    deletedCount: v.number(),
  }),
  handler: async (ctx) => {
    try {
      const tables = [
        "messages",
        "transcripts",
        "conversations",
        "callSessions",
        "contextSummaries",
        "feedback",
        "queues",
        "tasks",
        "calendarEvents",
        "tickets",
        "userFavorites",
        "users",
        "vendors",
      ] as const;

      let deletedCount = 0;
      for (const table of tables) {
        const docs = await ctx.db.query(table as any).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          deletedCount++;
        }
      }

      return {
        success: true,
        message: "Database reset successfully",
        deletedCount,
      };
    } catch (error) {
      console.error("Database reset failed:", error);
      return {
        success: false,
        message: `Database reset failed: ${error}`,
        deletedCount: 0,
      };
    }
  },
});

export const resetAuthDatabase = internalMutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    deletedCount: v.number(),
  }),
  handler: async (ctx) => {
    try {
      const authTables = [
        "accounts",
        "sessions",
        "verifications",
      ];

      let deletedCount = 0;
      for (const table of authTables) {
        const docs = await ctx.db.query(table as any).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          deletedCount++;
        }
      }

      return {
        success: true,
        message: "Auth database reset successfully",
        deletedCount,
      };
    } catch (error) {
      console.error("Auth database reset failed:", error);
      return {
        success: false,
        message: `Auth database reset failed: ${error}`,
        deletedCount: 0,
      };
    }
  },
});

export const resetEverything = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    totalDeleted: v.number(),
  }),
  handler: async (ctx): Promise<ResetResult> => {
    try {
      const appResult = await ctx.runMutation(internal.functions.manage.reset.resetDatabase);
      
      if (!appResult.success) {
        return {
          success: false,
          message: appResult.message,
          totalDeleted: 0,
        };
      }

      const authResult = await ctx.runMutation(internal.functions.manage.reset.resetAuthDatabase);
      
      if (!authResult.success) {
        return {
          success: false,
          message: authResult.message,
          totalDeleted: appResult.deletedCount,
        };
      }

      return {
        success: true,
        message: "All databases reset successfully",
        totalDeleted: (appResult.deletedCount || 0) + (authResult.deletedCount || 0),
      };
    } catch (error) {
      console.error("Complete reset failed:", error);
      return {
        success: false,
        message: `Complete reset failed: ${error}`,
        totalDeleted: 0,
      };
    }
  },
});
