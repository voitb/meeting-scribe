"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Loader2,
  Search,
  Calendar,
  SortAsc,
  SortDesc,
  FileAudio,
  FilterX,
} from "lucide-react";
import { formatDistance } from "date-fns";
import { useConvexAuth } from "convex/react";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortBy, setSortBy] = useState<"analysisDate" | "title">(
    "analysisDate"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Convert UI state to query parameters
  const queryParams = {
    searchTerm,
    startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
    sortBy,
    sortDirection,
    limit: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage,
  };

  // Fetch analyses with filters
  const analysesResult = useQuery(api.audio.filterAudioAnalyses, queryParams);

  // Handle loading and authentication state
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Check if filters are active
  const hasActiveFilters =
    searchTerm !== "" ||
    dateRange !== undefined ||
    sortBy !== "analysisDate" ||
    sortDirection !== "desc";

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateRange(undefined);
    setSortBy("analysisDate");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-6 pb-8">
        <PageHeader />

        {/* Filters */}
        <div className="bg-card rounded-lg p-5 mb-8 shadow-sm border">
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <div className="text-sm font-medium mb-2 text-muted-foreground">
                  Search
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by title or content..."
                    className="pl-9 h-10"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm font-medium mb-2 text-muted-foreground">
                  Date Range
                </div>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={(newRange) => {
                    setDateRange(newRange);
                    setCurrentPage(1); // Reset to first page when changing filters
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 items-end border-t border-border pt-4">
              <div className="flex gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-medium mb-2 text-muted-foreground">
                    Sort By
                  </div>
                  <Select
                    value={sortBy}
                    onValueChange={(value: "analysisDate" | "title") => {
                      setSortBy(value);
                      setCurrentPage(1); // Reset to first page when changing filters
                    }}
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
                    onClick={toggleSortDirection}
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
                  onClick={clearFilters}
                  className="sm:self-end h-10"
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results count */}
        {analysesResult && (
          <div className="mb-4 text-muted-foreground flex items-center gap-2">
            <span className="font-medium text-foreground">
              {analysesResult.total}
            </span>{" "}
            analyses found
          </div>
        )}

        {/* Results grid */}
        {!analysesResult ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : analysesResult.analyses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No analysis results match your filters.
            </p>
            {analysesResult.total > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            {analysesResult.total === 0 && (
              <div className="mt-4">
                <p className="mb-4">
                  You haven&apos;t created any analyses yet.
                </p>
                <Button asChild>
                  <Link href="/">Create your first analysis</Link>
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {analysesResult.analyses.map((analysis) => {
              const date = new Date(analysis.analysisDate);
              const timeAgo = formatDistance(date, new Date(), {
                addSuffix: true,
              });
              const hasAudio = !!analysis.audioSize;

              return (
                <Card
                  key={analysis._id}
                  className="overflow-hidden flex flex-col hover:shadow-md transition-all border-muted/70 hover:border-primary/30"
                >
                  <CardContent className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-medium text-lg line-clamp-2">
                        {analysis.title}
                      </h3>
                      {hasAudio && (
                        <div
                          className="flex-shrink-0 text-primary"
                          title="Audio available"
                        >
                          <FileAudio className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {analysis.summary.substring(0, 150)}...
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysis.keyPoints.slice(0, 2).map((point, idx) => (
                        <div
                          key={idx}
                          className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full truncate max-w-[200px]"
                        >
                          {point.substring(0, 30)}
                          {point.length > 30 ? "..." : ""}
                        </div>
                      ))}
                      {analysis.keyPoints.length > 2 && (
                        <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          +{analysis.keyPoints.length - 2} more
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 py-3 border-t bg-muted/10 flex justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{timeAgo}</span>
                    </div>

                    <Button size="sm" variant="default" asChild>
                      <Link href={`/result/${analysis.url}`}>View</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {analysesResult &&
          analysesResult.pagination &&
          analysesResult.total > itemsPerPage && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={!analysesResult.pagination.hasMore}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
