import { WALLET_CONFIG } from "../config/walletConfig";
import { TantoConnectButton } from "@sky-mavis/tanto-widget";

export function WalletConnectButton() {
  if (WALLET_CONFIG.provider === 'appkit') {
    return (
      <div className="flex flex-col items-center gap-4">
        <h3 className="font-bold text-lg">Connect with AppKit</h3>
        <p className="text-sm text-gray-600 text-center max-w-sm">
          Connect with Ronin wallet, MetaMask, or social logins (Google, X, Discord, Apple, GitHub)
        </p>
        <appkit-button />
      </div>
    );
  }

  // Tanto Widget button
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="font-bold text-lg">Connect with Tanto Widget</h3>
      <p className="text-sm text-gray-600 text-center max-w-sm">
        Connect with Ronin Wallet, Waypoint, or WalletConnect
      </p>
      <TantoConnectButton />
    </div>
  );
}