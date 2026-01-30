import { internalMutation, action } from "../../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../../_generated/dataModel";
import { internal } from "../../../_generated/api";

export const seedFoodStoryInternal = internalMutation({
  args: {},
  returns: v.object({
    restaurantCreated: v.boolean(),
    staffCreated: v.number(),
    categoriesCreated: v.number(),
    itemsCreated: v.number(),
    tablesCreated: v.number(),
  }),
  handler: async (ctx) => {
    const restaurantData = {
      name: "Food Story",
      address: "Dubai Tower, Airport Road, Kohinoor",
      phone: "+91-9876543210",
      currency: "INR",
      adminEmail: "admin@foodstory.com",
      adminName: "Food Story Admin",
      staff: [
        { email: "basheerstc129@gmail.com", name: "Basheer", role: "admin" as const },
      ],
      categories: [
        {
          name: "Shakes",
          order: 1,
          items: [
            { name: "Mango Alfonso", description: "Fresh mango shake with Alphonso mangoes", price: 80, type: "veg" as const, isAvailable: true },
            { name: "Chicku", description: "Creamy sapota shake", price: 80, type: "veg" as const, isAvailable: true },
            { name: "Tender Coconut", description: "Refreshing tender coconut shake", price: 100, type: "veg" as const, isAvailable: true },
            { name: "Avocado", description: "Rich and creamy avocado shake", price: 90, type: "veg" as const, isAvailable: true },
            { name: "Strawberry", description: "Sweet strawberry shake", price: 90, type: "veg" as const, isAvailable: true },
            { name: "Banana Bonkers", description: "Banana shake with extra toppings", price: 70, type: "veg" as const, isAvailable: true },
            { name: "Butter Scotch", description: "Buttery sweet shake", price: 80, type: "veg" as const, isAvailable: true },
            { name: "Chocolate", description: "Classic chocolate shake", price: 80, type: "veg" as const, isAvailable: true },
            { name: "KitKat", description: "KitKat chocolate shake", price: 90, type: "veg" as const, isAvailable: true },
            { name: "Snickers", description: "Snickers chocolate shake", price: 90, type: "veg" as const, isAvailable: true },
            { name: "Dairy Milk", description: "Dairy Milk chocolate shake", price: 90, type: "veg" as const, isAvailable: true },
            { name: "Oreo", description: "Oreo cookie shake", price: 80, type: "veg" as const, isAvailable: true },
          ],
        },
        {
          name: "Cold coffee",
          order: 2,
          items: [
            { name: "Hard Rock Coffee", description: "Strong cold coffee with ice", price: 80, type: "veg" as const, isAvailable: true },
            { name: "Chocolate Coffee", description: "Coffee with chocolate flavor", price: 80, type: "veg" as const, isAvailable: true },
            { name: "White House", description: "Creamy white coffee", price: 70, type: "veg" as const, isAvailable: true },
            { name: "Coffee on the Rocks", description: "Coffee served over ice rocks", price: 90, type: "veg" as const, isAvailable: true },
          ],
        },
        {
          name: "Bizzaro Falooda",
          order: 3,
          items: [
            { name: "Normal", description: "Classic falooda with basil seeds", price: 100, type: "veg" as const, isAvailable: true },
            { name: "Royal", description: "Premium falooda with extra toppings", price: 130, type: "veg" as const, isAvailable: true },
            { name: "Dry Fruits", description: "Falooda with mixed dry fruits", price: 150, type: "veg" as const, isAvailable: true },
            { name: "Chocolate", description: "Chocolate flavored falooda", price: 140, type: "veg" as const, isAvailable: true },
          ],
        },
        {
          name: "Shawaya",
          order: 4,
          items: [
            { name: "Quarter", description: "Quarter portion of shawaya", price: 110, type: "non-veg" as const, isAvailable: true },
            { name: "Half", description: "Half portion of shawaya", price: 220, type: "non-veg" as const, isAvailable: true },
            { name: "Full", description: "Full portion of shawaya", price: 420, type: "non-veg" as const, isAvailable: true },
          ],
        },
        {
          name: "Scoops",
          order: 5,
          items: [
            { name: "Vanila", description: "Classic vanilla ice cream scoop", price: 30, type: "veg" as const, isAvailable: true },
            { name: "Strawberry", description: "Fresh strawberry ice cream scoop", price: 30, type: "veg" as const, isAvailable: true },
            { name: "Butter Scotch", description: "Butter scotch ice cream scoop", price: 50, type: "veg" as const, isAvailable: true },
            { name: "Jack Fruit", description: "Jack fruit ice cream scoop", price: 50, type: "veg" as const, isAvailable: true },
            { name: "Spanish Delight", description: "Spanish flavored ice cream scoop", price: 50, type: "veg" as const, isAvailable: true },
          ],
        },
        {
          name: "Combo",
          order: 6,
          items: [
            { name: "Quarter + Rice", description: "Quarter shawaya with rice", price: 170, type: "non-veg" as const, isAvailable: true },
            { name: "Half + Rice", description: "Half shawaya with rice", price: 335, type: "non-veg" as const, isAvailable: true },
            { name: "Full + Rice", description: "Full shawaya with rice", price: 750, type: "non-veg" as const, isAvailable: true },
          ],
        },
        {
          name: "Fresh juices",
          order: 7,
          items: [
            { name: "Musambi", description: "Fresh sweet lime juice", price: 40, type: "veg" as const, isAvailable: true },
            { name: "Pappaya", description: "Fresh papaya juice", price: 40, type: "veg" as const, isAvailable: true },
            { name: "Mango", description: "Fresh mango juice", price: 50, type: "veg" as const, isAvailable: true },
            { name: "Chicku", description: "Fresh sapota juice", price: 40, type: "veg" as const, isAvailable: true },
            { name: "Grape", description: "Fresh grape juice", price: 50, type: "veg" as const, isAvailable: true },
            { name: "Pineapple", description: "Fresh pineapple juice", price: 50, type: "veg" as const, isAvailable: true },
          ],
        },
        {
          name: "Shawarma",
          order: 8,
          items: [
            { name: "Normal Roll", description: "Regular shawarma roll", price: 70, type: "non-veg" as const, isAvailable: true },
            { name: "Normal Plate", description: "Shawarma plate with regular portion", price: 90, type: "non-veg" as const, isAvailable: true },
            { name: "Full Meat Roll", description: "Shawarma roll with extra meat", price: 90, type: "non-veg" as const, isAvailable: true },
            { name: "Full Meat Plate", description: "Shawarma plate with extra meat", price: 120, type: "non-veg" as const, isAvailable: true },
            { name: "Rumali Normal", description: "Rumali roti shawarma regular", price: 110, type: "non-veg" as const, isAvailable: true },
            { name: "Rumali Full Meat", description: "Rumali roti shawarma with extra meat", price: 140, type: "non-veg" as const, isAvailable: true },
            { name: "Rumali Chees Meat", description: "Rumali roti shawarma with cheese and meat", price: 150, type: "non-veg" as const, isAvailable: true },
          ],
        },
        {
          name: "Krushers",
          order: 9,
          items: [
            { name: "Kanthari Soda", description: "Spicy kanthari soda drink", price: 30, type: "veg" as const, isAvailable: true },
            { name: "Boost", description: "Energy boost drink", price: 30, type: "veg" as const, isAvailable: true },
          ],
        },
      ],
      tables: Array.from({ length: 8 }, (_, i) => ({
        number: i + 1,
        label: `Table ${i + 1}`,
        status: "active" as const,
      })),
    };

    let restaurantCreated = false;
    let staffCreated = 0;
    let categoriesCreated = 0;
    let itemsCreated = 0;
    let tablesCreated = 0;

    const restaurantId = await ctx.db.insert("restaurants", {
      name: restaurantData.name,
      address: restaurantData.address,
      phone: restaurantData.phone,
      currency: restaurantData.currency,
    });
    restaurantCreated = true;

    await ctx.db.insert("staff", {
      email: restaurantData.adminEmail,
      name: restaurantData.adminName,
      restaurantId,
      role: "admin",
    });
    staffCreated++;

    for (const staffMember of restaurantData.staff) {
      await ctx.db.insert("staff", {
        email: staffMember.email,
        name: staffMember.name,
        restaurantId,
        role: staffMember.role,
      });
      staffCreated++;
    }

    const categoryIds: Record<string, Id<"menuCategories">> = {};
    for (const categoryData of restaurantData.categories) {
      const categoryId = await ctx.db.insert("menuCategories", {
        name: categoryData.name,
        restaurantId,
        order: categoryData.order,
      });
      categoriesCreated++;
      categoryIds[categoryData.name] = categoryId;

      for (const itemData of categoryData.items) {
        await ctx.db.insert("menuItems", {
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          categoryId,
          restaurantId,
          type: itemData.type,
          isAvailable: itemData.isAvailable,
        });
        itemsCreated++;
      }
    }

    for (const tableData of restaurantData.tables) {
      await ctx.db.insert("tables", {
        number: tableData.number,
        label: tableData.label,
        restaurantId,
        status: tableData.status,
      });
      tablesCreated++;
    }

    return {
      restaurantCreated,
      staffCreated,
      categoriesCreated,
      itemsCreated,
      tablesCreated,
    };
  },
});

export const seedFoodStory = action({
  args: {},
  returns: v.object({
    restaurantCreated: v.boolean(),
    staffCreated: v.number(),
    categoriesCreated: v.number(),
    itemsCreated: v.number(),
    tablesCreated: v.number(),
  }),
  handler: async (ctx): Promise<{
    restaurantCreated: boolean;
    staffCreated: number;
    categoriesCreated: number;
    itemsCreated: number;
    tablesCreated: number;
  }> => {
    return await ctx.runMutation(internal.functions.manage.restraunts.foodstory.seedFoodStoryInternal, {});
  },
});