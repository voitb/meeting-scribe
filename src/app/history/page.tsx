"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { useAnalysisFilters } from "@/hooks/history/use-analysis-filters";
import { AnalysisFilterPanel } from "@/components/history/filter-panel";
import { AnalysisGrid } from "@/components/history/analysis-grid";
import { PaginationControls } from "@/components/history/pagination-controls";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const { filters, setters, operations, state } = useAnalysisFilters();

  const { currentPage } = filters;
  const { itemsPerPage } = state;
  const { getQueryParams, clearFilters } = operations;
  const { setCurrentPage } = setters;

  const analysesResult = useQuery(
    api.audio.filterAudioAnalyses,
    getQueryParams()
  );

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

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 pt-6 pb-8">
          <PageHeader />

          <AnalysisFilterPanel
            filters={filters}
            setters={setters}
            operations={operations}
            state={state}
          />

          {analysesResult && (
            <div className="mb-4 text-muted-foreground flex items-center gap-2">
              <span className="font-medium text-foreground">
                {analysesResult.total}
              </span>{" "}
              analyses found
            </div>
          )}

          <AnalysisGrid
            results={analysesResult}
            isLoading={!analysesResult}
            onClearFilters={clearFilters}
          />

          {analysesResult &&
            analysesResult.pagination &&
            analysesResult.total > itemsPerPage && (
              <PaginationControls
                currentPage={currentPage}
                totalItems={analysesResult.total}
                itemsPerPage={itemsPerPage}
                hasMore={analysesResult.pagination.hasMore}
                onPageChange={setCurrentPage}
              />
            )}
        </main>
      </div>
    </ScrollArea>
  );
}
