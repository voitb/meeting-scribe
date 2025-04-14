"use client";

import { Info } from "lucide-react";
import { useConvexAuth } from "convex/react";

/**
 * Component to display authentication status information
 */
export function AuthInfo() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  // Only render if we know for sure that the user is not authenticated
  if (isAuthLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="text-orange-600 dark:text-orange-400 mt-2 text-sm flex items-center gap-1.5">
        <Info className="h-4 w-4" />
        <span>You are not logged in. Sign in to save your analyses.</span>
      </div>
    );
  }

  return null;
}
