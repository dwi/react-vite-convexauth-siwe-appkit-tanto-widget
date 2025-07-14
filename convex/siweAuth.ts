import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { SiweMessage } from "siwe";

// Configuration for SIWE message generation
export const SIWE_CONFIG = {
  statement: "Sign in to Convex Auth",
  version: "1",
  chainId: 2020,
};


// Generate SIWE authentication message
export const generateSiweMessage = action({
  args: {
    walletAddress: v.string(),
    domain: v.string(),
    chainId: v.optional(v.number()),
  },
  handler: async (_, args): Promise<{
    message: string;
  }> => {
    // Generate cryptographically secure nonce
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const issuedAt = new Date().toISOString();

    // Create standard SIWE message
    const siweMessage = new SiweMessage({
      domain: args.domain,
      address: args.walletAddress,
      statement: SIWE_CONFIG.statement,
      uri: `https://${args.domain}`,
      version: SIWE_CONFIG.version,
      chainId: args.chainId || SIWE_CONFIG.chainId,
      nonce,
      issuedAt,
    });

    return {
      message: siweMessage.prepareMessage(),
    };
  },
});


// SIWE signature verification using standard SIWE library
export const verifySiweSignature = internalMutation({
  args: {
    walletAddress: v.string(),
    signature: v.string(),
    message: v.string(),
  },
  handler: async (_, args): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      // Use SIWE library for verification (includes nonce, timestamp, and signature validation)
      const siweMessage = new SiweMessage(args.message);
      await siweMessage.verify({ signature: args.signature });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? `SIWE verification failed: ${error.message}`
            : "An unknown error occurred.",
      };
    }
  },
});
