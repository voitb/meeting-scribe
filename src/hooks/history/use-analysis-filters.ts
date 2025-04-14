"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";

export type SortField = "analysisDate" | "title";
export type SortDirection = "asc" | "desc";

export interface AnalysisFilters {
  searchTerm: string;
  dateRange: DateRange | undefined;
  sortBy: SortField;
  sortDirection: SortDirection;
  currentPage: number;
}

export interface FilterQueryParams {
  searchTerm: string;
  startDate?: string;
  endDate?: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  limit: number;
  skip: number;
}

export function useAnalysisFilters(itemsPerPage: number = 12) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortBy, setSortBy] = useState<SortField>("analysisDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters =
    searchTerm !== "" ||
    dateRange !== undefined ||
    sortBy !== "analysisDate" ||
    sortDirection !== "desc";

  const clearFilters = () => {
    setSearchTerm("");
    setDateRange(undefined);
    setSortBy("analysisDate");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleSortByChange = (field: SortField) => {
    setSortBy(field);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getQueryParams = (): FilterQueryParams => ({
    searchTerm,
    startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
    sortBy,
    sortDirection,
    limit: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage,
  });

  return {
    filters: {
      searchTerm,
      dateRange,
      sortBy,
      sortDirection,
      currentPage,
    },
    setters: {
      setSearchTerm: handleSearchChange,
      setDateRange: handleDateRangeChange,
      setSortBy: handleSortByChange,
      setSortDirection,
      setCurrentPage: handlePageChange,
    },
    operations: {
      clearFilters,
      toggleSortDirection,
      getQueryParams,
    },
    state: {
      hasActiveFilters,
      itemsPerPage,
    },
  };
} 