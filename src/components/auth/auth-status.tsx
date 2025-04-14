"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LoginButton } from "./login-button";
import { InfoIcon } from "lucide-react";
import { useConvexAuth } from "convex/react";

export function AuthStatus() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isAuthenticated || isLoading) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <InfoIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Using the app without logging in</p>
            <p className="text-sm mb-2">
              Audio analysis has been generated successfully but hasn&apos;t
              been saved to an account. Without logging in, you won&apos;t have
              access to the results after leaving this page.
            </p>
            <div className="text-xs">
              <p>Log in to keep access to your analyses from any device</p>
            </div>
          </div>
          <LoginButton />
        </div>
      </CardContent>
    </Card>
  );
}
