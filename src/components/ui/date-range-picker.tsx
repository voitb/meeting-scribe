"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>(0);
  const [numberOfMonths, setNumberOfMonths] = React.useState(1);

  // Update content width when trigger width changes or on open
  React.useEffect(() => {
    if (triggerRef.current && open) {
      const newWidth = triggerRef.current.offsetWidth;
      setWidth(newWidth);

      // Set number of months based on width
      if (newWidth > 500) {
        setNumberOfMonths(2);
      } else {
        setNumberOfMonths(1);
      }
    }
  }, [open]);

  // Also update on window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (triggerRef.current) {
        const newWidth = triggerRef.current.offsetWidth;
        setWidth(newWidth);

        // Set number of months based on width
        if (newWidth > 500) {
          setNumberOfMonths(2);
        } else {
          setNumberOfMonths(1);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverTrigger asChild>
            <Button
              ref={triggerRef}
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>

          {date && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 absolute right-1 top-1/2 -translate-y-1/2 hover:bg-muted rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDateChange(undefined);
              }}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        <PopoverContent
          ref={contentRef}
          style={{ width: `${Math.max(width, 280)}px` }}
          className="p-0 justify-center"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={(newDate) => {
              onDateChange(newDate);
              if (newDate?.from && newDate?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={numberOfMonths}
            className="w-full"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
