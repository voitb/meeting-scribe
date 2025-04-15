"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressCards } from "@/components/progress-cards";
import { useAnalysisProcessor } from "@/hooks/analysis/use-analysis-processor";
import { LoadingState } from "./loading-state";
import { ProgressIndicator } from "./progress-indicator";
import { AnalysisSummary } from "./analysis-summary";
import ResultsTabs from "../results/results-tabs";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface AnalysisContentProps {
  audioId: string;
}

export default function AnalysisContent({ audioId }: AnalysisContentProps) {
  const router = useRouter();
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
    return (
      <Card className="border shadow-md">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              An Error Occurred
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              You will need to start a new analysis on the home page
            </p>
          </div>
        </CardContent>
      </Card>
    );
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

      {showResults && result && (
        <>
          <AnalysisSummary summary={result.summary} />
          <ResultsTabs result={result} skipSummary={true} />
        </>
      )}
    </div>
  );
}
