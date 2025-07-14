"use client";

import {
  useMutation,
  useQuery,
  useAction,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { WalletProvider } from "./components/WalletProvider";
import { WalletConnectButton } from "./components/WalletConnectButton";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "./components/AuthComponents";

export default function App() {
  return (
    <WalletProvider>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
        Convex + React + Convex Auth + AppKit/Tanto Widget
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">
        Convex + React + Convex Auth + AppKit/Tanto Widget
        </h1>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <WalletConnectForm />
        </Unauthenticated>
      </main>
    </WalletProvider>
  );
}

function SignOutButton() {
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const { signOut } = useAuthActions();
  const { disconnect } = useDisconnect();

  const handleSignOut = async () => {
    try {
      await signOut();
      disconnect();
    } catch (error) {
      console.error("Sign out error:", error);
      disconnect();
    }
  };

  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md px-2 py-1"
          onClick={() => void handleSignOut()}
        >
          Sign out
        </button>
      )}
    </>
  );
}

function WalletConnectForm() {
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessage, isPending } = useSignMessage({
    mutation: {
      onSuccess: (signature, { message }) => {
        void (async () => {
          try {
            console.log('Message signed successfully:', signature);
            
            // Use ConvexAuth standard signIn function (includes HTTP calls by design)
            await signIn("siwe", {
              walletAddress: address as `0x${string}`,
              signature,
              message,
            });
            
            setIsConnecting(false);
          } catch (error) {
            console.error('ConvexAuth sign in error:', error);
            setError(error instanceof Error ? error.message : 'Authentication failed');
            setIsConnecting(false);
          }
        })();
      },
      onError: (error) => {
        console.error('Message signing error:', error);
        setError('Failed to sign message: ' + error.message);
        setIsConnecting(false);
      },
    },
  });
  const generateSiweMessage = useAction(api.siweAuth.generateSiweMessage);
  
  // Manual sign button for testing
  const handleManualSign = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Generate authentication message (SIWE or custom)
      const siweData = await generateSiweMessage({
        walletAddress: address,
        domain: window.location.host,
        chainId: 2020, // Ronin network
      });
      
      console.log('Generated SIWE message:', siweData.message);
      
      // Request signature
      signMessage({ message: siweData.message });
      
    } catch (error) {
      console.error('Manual sign error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 mx-auto">
      <p className="text-center">Connect your wallet to see the numbers</p>
      <div className="flex flex-col gap-4 items-center">
        <WalletConnectButton />
        
        {/* Show connection status */}
        {isConnected && address && (
          <div className="bg-green-500/20 border-2 border-green-500/50 rounded-md p-2 w-full">
            <p className="text-dark dark:text-light font-mono text-xs">
              Connected: {address}
            </p>
          </div>
        )}
        
        {/* Manual sign button for testing */}
        {isConnected && address && (
          <button
            onClick={() => void handleManualSign()}
            disabled={isConnecting || isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isPending ? 'Sign Message...' : 'Sign SIWE Message'}
          </button>
        )}
        
        {(isConnecting || isPending) && (
          <div className="bg-blue-500/20 border-2 border-blue-500/50 rounded-md p-2 w-full">
            <p className="text-dark dark:text-light font-mono text-xs">
              {isPending ? 'Please sign the message in your wallet...' : 'Connecting wallet...'}
            </p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2 w-full">
            <p className="text-dark dark:text-light font-mono text-xs">
              Error: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Content() {
  const data = useQuery(api.myFunctions.listNumbers, {
    count: 10,
  });
  const addNumber = useMutation(api.myFunctions.addNumber);
  const addSpecialNumber = useMutation(api.myFunctions.addSpecialNumber);
  const clearAllNumbers = useMutation(api.myFunctions.clearAllNumbers);
  
  // Get current user role (like in the official example)
  const currentUser = useQuery(api.lib.permissions.getCurrentUserRole);

  if (!data) {
    return (
      <div className="mx-auto">
        <p>loading... (consider a loading skeleton)</p>
      </div>
    );
  }

  const { viewer, numbers, userRole } = data;
  // Simple role checking like in the official example
  const isAdmin = currentUser === "ADMIN";

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <div className="bg-blue-500/20 border-2 border-blue-500/50 rounded-md p-4">
        <p className="font-bold">Welcome {viewer ?? "Anonymous"}!</p>
        <p className="text-sm">Role: <span className="font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">{userRole}</span></p>
      </div>
      
      <p>
        Click the buttons below to test role-based access control!
      </p>
      
      <div className="flex flex-col gap-4">
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add Random Number (USER+)
        </button>
        
        <button
          className="bg-purple-600 text-white text-sm px-4 py-2 rounded-md border-2 disabled:opacity-50"
          disabled={!isAdmin}
          onClick={() => {
            void addSpecialNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add Special Number x100 (ADMIN)
        </button>
        
        <button
          className="bg-red-600 text-white text-sm px-4 py-2 rounded-md border-2 disabled:opacity-50"
          disabled={!isAdmin}
          onClick={() => {
            void clearAllNumbers();
          }}
        >
          Clear All Numbers (ADMIN)
        </button>
      </div>
      
      <p>
        Numbers:{" "}
        {numbers?.length === 0
          ? "Click a button!"
          : (numbers?.join(", ") ?? "...")}
      </p>
      <p>
        Edit{" "}
        <code className="text-sm font-bold font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded-md">
          convex/myFunctions.ts
        </code>{" "}
        to change your backend
      </p>
      <p>
        Edit{" "}
        <code className="text-sm font-bold font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded-md">
          src/App.tsx
        </code>{" "}
        to change your frontend
      </p>
      <div className="flex flex-col">
        <p className="text-lg font-bold">Useful resources:</p>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2 w-1/2">
            <ResourceCard
              title="Convex docs"
              description="Read comprehensive documentation for all Convex features."
              href="https://docs.convex.dev/home"
            />
            <ResourceCard
              title="Stack articles"
              description="Learn about best practices, use cases, and more from a growing
            collection of articles, videos, and walkthroughs."
              href="https://www.typescriptlang.org/docs/handbook/2/basic-types.html"
            />
          </div>
          <div className="flex flex-col gap-2 w-1/2">
            <ResourceCard
              title="Templates"
              description="Browse our collection of templates to get started quickly."
              href="https://www.convex.dev/templates"
            />
            <ResourceCard
              title="Discord"
              description="Join our developer community to ask questions, trade tips & tricks,
            and show off your projects."
              href="https://www.convex.dev/community"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-slate-200 dark:bg-slate-800 p-4 rounded-md h-28 overflow-auto">
      <a href={href} className="text-sm underline hover:no-underline">
        {title}
      </a>
      <p className="text-xs">{description}</p>
    </div>
  );
}
