import { ReactNode } from "react";
import { WALLET_CONFIG } from "../config/walletConfig";

// Shared imports
import { WagmiProvider, type Config } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// AppKit imports
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { ronin, saigon } from "@reown/appkit/networks";

// Tanto Widget imports
import { getDefaultConfig, TantoProvider } from "@sky-mavis/tanto-widget";


// Create QueryClient
const queryClient = new QueryClient();

// Configure based on provider
let wagmiConfig: Config;

if (WALLET_CONFIG.provider === 'appkit') {
  // Configure AppKit
  const appKitProjectId = WALLET_CONFIG.appkit.projectId;
  
  // Create wagmi adapter for AppKit
  const wagmiAdapter = new WagmiAdapter({
    ssr: true,
    projectId: appKitProjectId,
    networks: [ronin, saigon],
  });
  
  // Create AppKit instance
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: appKitProjectId,
    networks: [ronin],
    defaultNetwork: ronin,
    metadata: WALLET_CONFIG.appkit.metadata,
    features: {
      analytics: false,
      swaps: false,
      onramp: false,
      email: true,
      socials: WALLET_CONFIG.appkit.features.socials,
    },
    featuredWalletIds: WALLET_CONFIG.appkit.featuredWalletIds,
  });
  
  wagmiConfig = wagmiAdapter.wagmiConfig;
} else {
  // Configure Tanto Widget
  wagmiConfig = getDefaultConfig({
    keylessWalletConfig: {
      enable: import.meta.env.VITE_WAYPOINT_CLIENT_ID ? true : false,
      chainId: ronin.id,
      clientId: import.meta.env.VITE_WAYPOINT_CLIENT_ID,
    },
    chains: [ronin, saigon],
    ssr: true,
  });
}


interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {WALLET_CONFIG.provider === 'tanto' ? (
          <TantoProvider>
            {children}
          </TantoProvider>
        ) : (
          children
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}