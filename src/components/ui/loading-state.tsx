"use client";

import { Loader2 } from "lucide-react";

/**
 * Loading state component for the results page
 */
export function LoadingState() {
  return (
    <div className="flex justify-center items-center py-10 sm:py-20">
      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
      <span className="ml-2 text-sm sm:text-base text-muted-foreground">
        Loading content...
      </span>
    </div>
  );
}
