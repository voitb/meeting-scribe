"use client";

import { Clock } from "lucide-react";

/**
 * Decisions tab component
 */
export function DecisionsTab({ decisions }: { decisions: string[] }) {
  if (!decisions || decisions.length === 0) return null;

  return (
    <div className="prose max-w-none dark:prose-invert">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
        Decisions Made
      </h3>
      <ul className="space-y-2 sm:space-y-3">
        {decisions.map((decision, index) => (
          <li key={index} className="bg-muted p-3 sm:p-4 rounded-lg flex">
            <div className="rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="text-sm sm:text-base text-foreground">
              {decision}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
