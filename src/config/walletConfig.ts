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
      '541d5dcd4ede02f3afaf75bf8e3e4c4f1fb09edb5fa6c4377ebf31c2785d9adf', // Ronin Wallet
    ],
  },
  
  // Tanto Widget configuration 
  tanto: {
    clientId: import.meta.env.VITE_WAYPOINT_CLIENT_ID,
  }
};
