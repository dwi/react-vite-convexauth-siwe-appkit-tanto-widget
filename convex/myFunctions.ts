import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireRole, VALID_ROLES } from "./lib/permissions";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Get current user profile
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    return user;
  },
});

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);
    return {
      viewer: user?.walletAddress ?? user?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
      userRole: user?.role ?? VALID_ROLES.USER,
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    // Require user to be authenticated
    await requireRole(ctx, VALID_ROLES.USER);

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// Admin feature - add special number (admin only)
export const addSpecialNumber = mutation({
  args: {
    value: v.number(),
  },
  handler: async (ctx, args) => {
    // Require admin role
    await requireRole(ctx, VALID_ROLES.ADMIN);

    const id = await ctx.db.insert("numbers", { value: args.value * 100 }); // Admin multiplier
    console.log("Added special number with id:", id);
    return id;
  },
});

// Admin feature - clear all numbers (admin only)
export const clearAllNumbers = mutation({
  args: {},
  handler: async (ctx) => {
    // Require admin role
    await requireRole(ctx, VALID_ROLES.ADMIN);

    const numbers = await ctx.db.query("numbers").collect();
    for (const number of numbers) {
      await ctx.db.delete(number._id);
    }
    console.log("Cleared all numbers");
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});
