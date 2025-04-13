"use client";

import { ReactNode } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";

// Making sure Clerk key is available
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
