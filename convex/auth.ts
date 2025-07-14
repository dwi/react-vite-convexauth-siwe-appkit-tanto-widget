import { convexAuth, createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { Id } from "./_generated/dataModel";
import { VALID_ROLES } from "./lib/permissions";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      id: "siwe",
      authorize: async (params, ctx): Promise<{ userId: Id<"users"> } | null> => {
        const walletAddress = params.walletAddress as string;
        const signature = params.signature as string;
        const message = params.message as string;

        if (!walletAddress || !signature || !message) {
          throw new ConvexError("Wallet address, signature, and message are required");
        }

        // Verify SIWE signature first using internal mutation
        const verificationResult = await ctx.runMutation(internal.siweAuth.verifySiweSignature, {
          walletAddress: walletAddress.toLowerCase(),
          signature,
          message,
        });

        if (!verificationResult.success) {
          throw new ConvexError(verificationResult.error || "SIWE signature verification failed");
        }

        const normalizedWalletAddress = walletAddress.toLowerCase();

        try {
          // Try to retrieve existing account first
          const existingAccount = await retrieveAccount(ctx, {
            provider: "siwe",
            account: {
              id: normalizedWalletAddress,
            },
          });

          // If account exists, return the user
          if (existingAccount && existingAccount.user) {
            return { userId: existingAccount.user._id as Id<"users"> };
          }
        } catch (error) {
          // Account doesn't exist, proceed to create new one
          console.log("Account not found, creating new one:", error);
        }

        // If no account exists, create a new one
        const newAccount = await createAccount(ctx, {
          provider: "siwe",
          account: {
            id: normalizedWalletAddress,
          },
          profile: {
            walletAddress: normalizedWalletAddress,
            name: normalizedWalletAddress,
            role: VALID_ROLES.USER, // Default role
          },
        });

        return { userId: newAccount.user._id as Id<"users"> };
      },
    })
  ],
});
