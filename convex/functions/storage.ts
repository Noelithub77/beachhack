import { mutation } from "../_generated/server";

// generate upload URL for client-side uploads
export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});
