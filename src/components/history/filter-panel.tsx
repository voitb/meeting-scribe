"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SearchFilter } from "./search-filter";
import { DateFilter } from "./date-filter";
import { SortControls } from "./sort-controls";
import type {
  SortDirection,
  SortField,
} from "@/hooks/history/use-analysis-filters";
import type { DateRange } from "react-day-picker";

interface AnalysisFilterPanelProps {
  filters: {
    searchTerm: string;
    dateRange: DateRange | undefined;
    sortBy: SortField;
    sortDirection: SortDirection;
  };
  setters: {
    setSearchTerm: (value: string) => void;
    setDateRange: (range: DateRange | undefined) => void;
    setSortBy: (value: SortField) => void;
  };
  operations: {
    toggleSortDirection: () => void;
    clearFilters: () => void;
  };
  state: {
    hasActiveFilters: boolean;
  };
}

/**
 * Panel filtrowania dla historii analiz
 */
export function AnalysisFilterPanel({
  filters,
  setters,
  operations,
  state,
}: AnalysisFilterPanelProps) {
  const { searchTerm, dateRange, sortBy, sortDirection } = filters;
  const { setSearchTerm, setDateRange, setSortBy } = setters;
  const { toggleSortDirection, clearFilters } = operations;
  const { hasActiveFilters } = state;

  return (
    <Card className="mb-6 border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
          </div>

          <SortControls
            sortBy={sortBy}
            sortDirection={sortDirection}
            hasActiveFilters={hasActiveFilters}
            onSortByChange={setSortBy}
            onToggleSortDirection={toggleSortDirection}
            onClearFilters={clearFilters}
          />
        </div>
      </CardContent>
    </Card>
  );
}
