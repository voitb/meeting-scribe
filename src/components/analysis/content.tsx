"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressCards } from "@/components/progress-cards";
import { useAnalysisProcessor } from "@/hooks/analysis/use-analysis-processor";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";
import { ProgressIndicator } from "./progress-indicator";
import { AnalysisSummary } from "./analysis-summary";
import ResultsTabs from "../results/results-tabs";

interface AnalysisContentProps {
  audioId: string;
}

export default function AnalysisContent({ audioId }: AnalysisContentProps) {
  const searchParams = useSearchParams();
  const language = searchParams?.get("language") || "english";

  const {
    result,
    processing,
    currentStep,
    startTime,
    error,
    showResults,
    dataSource,
    analysisStatus,
    steps,
  } = useAnalysisProcessor({
    audioId,
    language,
  });

  if (processing && !showResults) {
    return (
      <Card className="border shadow-md">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            Analysis Progress
          </h2>
          <ProgressCards currentStep={currentStep} startTime={startTime} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!result || !showResults) {
    return (
      <LoadingState
        message={
          dataSource === "database"
            ? "Loading saved analysis..."
            : "Processing audio analysis..."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {processing && (
        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          analysisStatus={analysisStatus}
        />
      )}

      {error && (
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">An error occurred</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      )}

      {showResults && result && (
        <>
          <AnalysisSummary summary={result.summary} />
          <ResultsTabs result={result} skipSummary={true} />
        </>
      )}
    </div>
  );
}
