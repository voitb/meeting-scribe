"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LoginButton } from "./login-button";
import { InfoIcon } from "lucide-react";
import { useConvexAuth } from "convex/react";

export function AuthStatus() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // If user is authenticated, don't show this component
  if (isAuthenticated || isLoading) {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-blue-600 dark:text-blue-400 flex-1">
            <p className="font-medium">Using the app without logging in</p>
            <p className="text-sm mb-2">
              Audio analysis has been generated successfully but hasn&apos;t
              been saved to an account. Without logging in, you won&apos;t have
              access to the results after leaving this page.
            </p>
            <div className="text-xs text-blue-500 dark:text-blue-300">
              <p>Log in to keep access to your analyses from any device</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </CardContent>
    </Card>
  );
}
