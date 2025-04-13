"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth, SignOutButton } from "@clerk/clerk-react";

export function LogoutButton() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return null;
  }

  return (
    <SignOutButton>
      <Button variant="outline" className="gap-2">
        <LogOut size={16} />
        Log out
      </Button>
    </SignOutButton>
  );
}
