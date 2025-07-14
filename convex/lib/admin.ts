import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { VALID_ROLES, roleValidator, requireRole } from "./permissions";

// Set user role by wallet address (for testing/admin management)
export const setUserRole = mutation({
  args: {
    walletAddress: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    // Require admin role to change user roles
    await requireRole(ctx, VALID_ROLES.ADMIN);

    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
    });

    return {
      success: true,
      message: `User ${args.walletAddress} role updated to ${args.role}`,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        previousRole: user.role ?? VALID_ROLES.USER,
        newRole: args.role,
      }
    };
  },
});

// Get all users for admin management
export const getAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Require admin role to view all users
    await requireRole(ctx, VALID_ROLES.ADMIN);

    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      walletAddress: user.walletAddress,
      role: user.role ?? VALID_ROLES.USER,
    }));
  },
});