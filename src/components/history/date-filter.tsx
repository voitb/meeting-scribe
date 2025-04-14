"use client";

import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface DateFilterProps {
  dateRange: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
}

export function DateFilter({ dateRange, onDateChange }: DateFilterProps) {
  return (
    <div className="flex-1">
      <div className="text-sm font-medium mb-2 text-muted-foreground">
        Date Range
      </div>
      <div className="flex justify-center w-full">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={onDateChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
