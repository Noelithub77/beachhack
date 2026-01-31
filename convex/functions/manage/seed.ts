import { v } from "convex/values";
import { mutation, query, internalMutation } from "../../_generated/server";

// seed all sample data
export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // check if already seeded
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", "super@coco.com"))
            .first();

        if (existingUser) {
            return { success: false, message: "Already seeded" };
        }

        const now = Date.now();

        // create vendors
        const vendorCoco = await ctx.db.insert("vendors", {
            name: "COCO Support",
            primaryColor: "#6F8551",
            isActive: true,
            createdAt: now,
        });

        const vendorAcme = await ctx.db.insert("vendors", {
            name: "Acme Corp",
            primaryColor: "#3B82F6",
            isActive: true,
            createdAt: now,
        });

        // seed users - password is just "password" for demo
        const users = [
            { email: "customer@coco.com", name: "Alex Customer", role: "customer" as const, vendorId: undefined },
            { email: "customer2@coco.com", name: "Jordan Buyer", role: "customer" as const, vendorId: undefined },
            { email: "rep.l1@coco.com", name: "Sam Support L1", role: "rep_l1" as const, vendorId: vendorCoco },
            { email: "rep.l2@coco.com", name: "Taylor Support L2", role: "rep_l2" as const, vendorId: vendorCoco },
            { email: "rep.l3@coco.com", name: "Morgan Expert L3", role: "rep_l3" as const, vendorId: vendorCoco },
            { email: "admin.manager@coco.com", name: "Casey Manager", role: "admin_manager" as const, vendorId: vendorCoco },
            { email: "admin.senior@coco.com", name: "Riley Senior Admin", role: "admin_senior" as const, vendorId: vendorCoco },
            { email: "super@coco.com", name: "Super Admin", role: "admin_super" as const, vendorId: vendorCoco },
        ];

        const userIds: Record<string, any> = {};
        for (const user of users) {
            const id = await ctx.db.insert("users", {
                email: user.email,
                passwordHash: "password",
                name: user.name,
                role: user.role,
                vendorId: user.vendorId,
                language: "en",
                isActive: true,
                createdAt: now,
            });
            userIds[user.email] = id;
        }


        return {
            success: true,
            message: "Seeded successfully",
            data: {
                vendors: 2,
                users: users.length,
            },
        };
    },
});

// reset all data
export const reset = mutation({
    args: {},
    handler: async (ctx) => {
        // delete all data in reverse dependency order
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
            "users",
            "vendors",
        ] as const;

        let deleted = 0;
        for (const table of tables) {
            const docs = await ctx.db.query(table).collect();
            for (const doc of docs) {
                await ctx.db.delete(doc._id);
                deleted++;
            }
        }

        return { success: true, deleted };
    },
});
