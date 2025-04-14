"use client";

import GlossaryView from "@/components/glossary-view";

interface GlossaryTabProps {
  glossary: Record<string, string>;
}

export function GlossaryTab({ glossary }: GlossaryTabProps) {
  if (!glossary || Object.keys(glossary).length === 0) return null;

  return <GlossaryView glossary={glossary} />;
}
