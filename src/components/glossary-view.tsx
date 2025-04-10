import { BookOpen } from "lucide-react";

interface GlossaryViewProps {
  glossary: Record<string, string>;
}

export default function GlossaryView({ glossary }: GlossaryViewProps) {
  const terms = Object.entries(glossary).sort(([termA], [termB]) =>
    termA.localeCompare(termB)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-foreground">
        Glossary of Terms
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {terms.map(([term, definition], index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <div className="bg-muted/50 p-3 border-b border-border flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="font-medium text-foreground">{term}</span>
            </div>
            <div className="p-4">
              <p className="text-foreground">{definition}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
