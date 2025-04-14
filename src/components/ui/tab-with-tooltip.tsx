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
  className?: string;
}

export function TabWithTooltip({
  icon,
  label,
  value,
  className = "flex items-center gap-1.5 p-1.5 sm:p-2 transition-all duration-200 ease-in-out data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-medium data-[state=active]:shadow-sm",
}: TabWithTooltipProps) {
  return (
    <TooltipProvider>
      <TabsTrigger value={value} className={className}>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              {icon}
              <span className="hidden lg:inline text-xs sm:text-sm">
                {label}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="lg:hidden">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TabsTrigger>
    </TooltipProvider>
  );
}
