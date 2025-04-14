"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { AnalysisCard } from "./analysis-card";

export interface Analysis {
  _id: string;
  title: string;
  summary: string;
  analysisDate: string;
  url: string;
  keyPoints: string[];
  audioSize?: number | null;
}

export interface AnalysisResults {
  analyses: Analysis[];
  total: number;
  pagination?: {
    hasMore: boolean;
  };
}

interface AnalysisGridProps {
  results: AnalysisResults | undefined;
  isLoading: boolean;
  onClearFilters: () => void;
}

export function AnalysisGrid({
  results,
  isLoading,
  onClearFilters,
}: AnalysisGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!results) {
    return null;
  }

  if (results.analyses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">
          No analysis results match your filters.
        </p>
        {results.total > 0 && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
        {results.total === 0 && (
          <div className="mt-4">
            <p className="mb-4">You haven&apos;t created any analyses yet.</p>
            <Button asChild>
              <Link href="/">Create your first analysis</Link>
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {results.analyses.map((analysis) => (
        <AnalysisCard
          key={analysis._id}
          id={analysis._id}
          title={analysis.title}
          summary={analysis.summary}
          date={analysis.analysisDate}
          url={analysis.url.split("/").pop() || ""}
          keyPoints={analysis.keyPoints}
          hasAudio={!!analysis.audioSize}
        />
      ))}
    </div>
  );
}
