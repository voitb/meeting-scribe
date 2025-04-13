"use client";

import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/clerk-react";

export function LoginButton() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return null;
  }

  return (
    <SignInButton mode="modal">
      <Button variant="outline" className="gap-2">
        <LogIn size={16} />
        Log in
      </Button>
    </SignInButton>
  );
}
