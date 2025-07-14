import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";

// Define roles and hierarchy in one place
export const VALID_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN"
} as const;

// Role hierarchy: higher number = more permissions
const roleHierarchy = {
  USER: 0,
  ADMIN: 1
};

export type Role = (typeof VALID_ROLES)[keyof typeof VALID_ROLES];

// Create reusable role validator based on VALID_ROLES
export const roleValidator = v.union(
  ...Object.values(VALID_ROLES).map(role => v.literal(role))
);

// Helper to check if user has required permission level (like official example)
export async function checkPermission(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  requiredRole: Role
): Promise<boolean> {
  const user = await ctx.db.get(userId);
  const userRole = (user?.role ?? VALID_ROLES.USER) as Role;

  if (!(userRole in roleHierarchy) || !(requiredRole in roleHierarchy)) {
    return false;
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Simple helper to require a role (throws if insufficient)
export const requireRole = async (ctx: QueryCtx | MutationCtx, requiredRole: Role): Promise<void> => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const hasPermission = await checkPermission(ctx, userId as Id<"users">, requiredRole);
  if (!hasPermission) {
    const user = await ctx.db.get(userId as Id<"users">);
    const userRole = (user?.role ?? VALID_ROLES.USER) as Role;
    throw new Error(`Insufficient permissions. Required: ${requiredRole}, User has: ${userRole}`);
  }
};

// Get current user's role
export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx): Promise<Role | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId as Id<"users">);
    return (user?.role ?? VALID_ROLES.USER) as Role;
  },
});


// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    targetUserId: v.id("users"),
    newRole: roleValidator
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, VALID_ROLES.ADMIN);

    await ctx.db.patch(args.targetUserId, {
      role: args.newRole,
    });
  },
});