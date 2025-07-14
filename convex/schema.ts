import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { roleValidator } from "./lib/permissions";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  // Override the users table to include wallet addresses and roles
  users: defineTable({
    // Wallet-specific fields
    walletAddress: v.optional(v.string()),
    role: v.optional(roleValidator),

    // ConvexAuth standard fields
    image: v.optional(v.string()),
    name: v.optional(v.string()),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_role", ["role"]),
});
