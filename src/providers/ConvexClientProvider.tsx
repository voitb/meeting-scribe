"use client";

import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ReactNode } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        baseTheme: dark,
        elements: {
          // Główne elementy
          rootBox: "text-foreground",
          card: "bg-card border border-border shadow-md",

          // Nagłówki i typografia
          headerTitle: "text-foreground text-2xl",
          headerSubtitle: "text-muted-foreground",
          formFieldLabel: "text-foreground",

          // Przyciski i interaktywne elementy
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          formButtonReset: "text-muted-foreground hover:text-foreground",

          // Pola formularzy
          formFieldInput:
            "bg-input border-border text-foreground focus:border-primary",
          formFieldInputShowPasswordButton:
            "text-muted-foreground hover:text-foreground",

          // Social buttons
          socialButtonsIconButton: "border-border hover:bg-muted",
          socialButtonsBlockButton:
            "border-border hover:bg-muted text-foreground",
          socialButtonsProviderIcon: "text-foreground",

          // Divider
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",

          // Linki
          footerActionText: "text-muted-foreground",
          footerActionLink: "text-primary hover:text-primary/90",
          identityPreviewEditButton: "text-primary",

          // Avatar i User Button
          avatarBox: "border-2 border-primary/20 hover:border-primary/40",
          userButtonPopoverCard: "bg-popover border border-border shadow-md",
          userButtonPopoverActionButton: "text-foreground hover:bg-muted",
          userButtonPopoverActionButtonText: "text-foreground",
          userButtonPopoverActionButtonIcon: "text-muted-foreground",

          // Alternatywne przyciski
          alternativeMethodsBlockButton:
            "border-border hover:bg-muted text-foreground",

          // Komunikaty
          alert: "bg-muted border-border text-foreground",
          alertText: "text-foreground",
          alertIcon: "text-primary",

          // Badge
          badge: "bg-secondary text-secondary-foreground",

          // Spinner
          spinner: "text-primary",

          // Pola OTP
          otpCodeFieldInput:
            "bg-input border-border text-foreground focus:border-primary",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
