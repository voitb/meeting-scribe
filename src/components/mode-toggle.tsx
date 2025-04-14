"use client";

import { ThemeToggle } from "@/components/theme-toggle";

// This component is an alias for ThemeToggle to maintain compatibility with existing imports
export function ModeToggle() {
  return <ThemeToggle />;
}

// We also export it as default to allow different import methods
export default ModeToggle;
