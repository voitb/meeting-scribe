"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortAsc, SortDesc, FilterX } from "lucide-react";
import { SortDirection, SortField } from "@/hooks/history/use-analysis-filters";

interface SortControlsProps {
  sortBy: SortField;
  sortDirection: SortDirection;
  hasActiveFilters: boolean;
  onSortByChange: (value: SortField) => void;
  onToggleSortDirection: () => void;
  onClearFilters: () => void;
}

export function SortControls({
  sortBy,
  sortDirection,
  hasActiveFilters,
  onSortByChange,
  onToggleSortDirection,
  onClearFilters,
}: SortControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 items-end border-t border-border pt-4">
      <div className="flex gap-3 flex-wrap">
        <div>
          <div className="text-sm font-medium mb-2 text-muted-foreground">
            Sort By
          </div>
          <Select
            value={sortBy}
            onValueChange={(value: SortField) => onSortByChange(value)}
          >
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analysisDate">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-sm font-medium mb-2 text-muted-foreground">
            Direction
          </div>
          <Button
            variant="outline"
            className="h-10 w-10"
            onClick={onToggleSortDirection}
            title={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
          >
            {sortDirection === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="sm:self-end h-10"
        >
          <FilterX className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
