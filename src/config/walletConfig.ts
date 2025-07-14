import { SocialProvider } from "@reown/appkit";

// Wallet configuration
export const WALLET_CONFIG = {
  // Choose wallet provider: 'appkit' or 'tanto'
  provider: 'tanto' as 'appkit' | 'tanto',
  
  // Reown AppKit configuration
  appkit: {
    projectId: import.meta.env.VITE_REOWN_PROJECT_ID || '',
    metadata: {
      name: 'Convex + React + Convex Auth',
      description: 'Wallet authentication with ConvexAuth',
      url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
      icons: ['https://avatars.githubusercontent.com/u/108554348?s=280&v=4']
    },
    features: {
      // Disable buy and swap features
      swaps: false,
      onramp: false,
      // Enable email and social logins
      email: true,
      socials: ['google', 'x', 'discord', 'apple', 'github'] as SocialProvider[],
    },
    // Featured wallets (Ronin wallet)
    featuredWalletIds: [
      'c7708575a2c3c9e6a8ab493d56cdcc56748ef4b18612e9b6e3f65423a9c3b969', // Ronin Wallet
    ],
  },
  
  // Tanto Widget configuration 
  tanto: {
    clientId: import.meta.env.VITE_WAYPOINT_CLIENT_ID,
  }
};