"use client";

import { ThemeToggle } from "@/components/theme-toggle";

// Ten komponent jest aliasem do ThemeToggle, aby zachować kompatybilność z istniejącymi importami
export function ModeToggle() {
  return <ThemeToggle />;
}

// Eksportujemy również domyślnie, aby umożliwić różne sposoby importu
export default ModeToggle;
