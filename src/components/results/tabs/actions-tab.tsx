"use client";

import { CheckSquare } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

type ActionItem = NonNullable<AnalysisResult["actionItems"]>[number];

/**
 * Tasks tab component
 */
export function ActionsTab({ actions }: { actions: ActionItem[] }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="prose max-w-none dark:prose-invert">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
        Tasks to Complete
      </h3>
      <ul className="space-y-2 sm:space-y-3">
        {actions.map((item, index) => (
          <li key={index} className="bg-muted p-3 sm:p-4 rounded-lg">
            <div className="flex items-start">
              <div className="rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">{item.task}</p>
                {item.dueDate && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Due date: {item.dueDate}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
