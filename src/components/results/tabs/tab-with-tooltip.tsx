"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TabWithTooltipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

/**
 * Komponent zakładki z obsługą tooltipa
 */
export function TabWithTooltip({ icon, label, value }: TabWithTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <TabsTrigger
            value={value}
            className="flex items-center gap-1.5 p-1.5 sm:p-2 data-[state=active]:bg-muted-foreground/10 data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            {icon}
            <span className="hidden lg:inline text-xs sm:text-sm">{label}</span>
          </TabsTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="lg:hidden">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
