import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AuthComponentProps {
  children: ReactNode;
}

export function Authenticated({ children }: AuthComponentProps) {
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  
  if (isAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}

export function Unauthenticated({ children }: AuthComponentProps) {
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  
  if (isAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}