"use client";
import Link from "next/link";
import { PenLine, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-10 w-full bg-background/75 backdrop-blur-lg py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <PenLine className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground hidden sm:inline-flex">
              MeetingScribe
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isSignedIn && (
              <Button variant="ghost" size="sm" asChild className="gap-1.5">
                <Link href="/history">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline-flex">History</span>
                </Link>
              </Button>
            )}
            <ThemeToggle />
            <LoginButton />
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </div>
    </header>
  );
}
