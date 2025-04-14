"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { Card } from "@/components/ui/card";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <Card className="p-8 border border-sidebar-border shadow-md bg-card/50">
        <div className="flex flex-col justify-center items-center py-10">
          <Loader2 className="h-10 w-10 animate-spin mb-2" />
          <span className="text-muted-foreground">
            Loading authentication...
          </span>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
