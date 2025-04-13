"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import type { VideoChapter } from "./video-chapters";
import ResultsTabs from "./results-tab";
import { ProgressCards } from "./progress-cards";
import { useConvexAuth } from "convex/react";
import { AuthStatus } from "./auth/auth-status";

export interface DifficultSegment {
  startTime: string;
  endTime: string;
  issue: string;
  improvement: string;
}

export interface PresentationQuality {
  overallClarity: string;
  difficultSegments: DifficultSegment[];
  improvementSuggestions: string[];
}

export interface AnalysisResult {
  title?: string;
  summary: string;
  keyPoints: string[];
  meetingOutcomes?: string[];
  actionItems?: {
    person: string;
    task: string;
    dueDate?: string;
  }[];
  audioChapters?: VideoChapter[];
  presentationQuality?: PresentationQuality;
  glossary?: Record<string, string>;
  analysisDate?: string;
}

export default function ResultsContent({ audioId }: { audioId: string }) {
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  // Get language from URL query parameter, default to English if not provided
  const outputLanguage = searchParams.get("lang") || "english";

  // Helper function to save analysis results
  const setAnalysisResult = (result: AnalysisResult) => {
    setResult(result);
  };

  const processAudio = async () => {
    if (!audioId) return;

    try {
      // First, check if we have saved transcription for this audio
      setCurrentStep(0);

      const transcriptionRes = await fetch(`/api/get-transcription/${audioId}`);

      if (!transcriptionRes.ok) {
        throw new Error(
          `Failed to get transcription. Status: ${transcriptionRes.status}`
        );
      }

      const { transcription } = await transcriptionRes.json();

      if (!transcription) {
        throw new Error("No transcription found for this audio");
      }

      // Get any additional metadata like original filename
      const metadataRes = await fetch(`/api/get-audio-metadata/${audioId}`);
      let originalFileName = null;

      if (metadataRes.ok) {
        try {
          const metadata = await metadataRes.json();
          originalFileName = metadata.originalFileName;
          console.log("Retrieved original filename:", originalFileName);
        } catch (err) {
          console.warn("Could not parse audio metadata", err);
        }
      }

      setCurrentStep(1);

      // Get audio details
      const response = await fetch(`/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioId,
          audioDetails: {
            title:
              originalFileName || `Audio Recording ${audioId.substring(0, 8)}`,
            originalFileName: originalFileName,
            id: audioId,
          },
          transcription,
          outputLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed. Status: ${response.status}`);
      }

      const result = await response.json();
      setCurrentStep(2);
      setAnalysisResult(result);

      setCurrentStep(3);
      setTimeout(() => {
        setShowResults(true);
        setProcessing(false);
      }, 1000);
    } catch (err) {
      console.error("Error processing audio:", err);
      // Użycie setError do zapisania błędu
      setError(
        err instanceof Error ? err.message : "Failed to process recording"
      );
      toast.error(
        err instanceof Error ? err.message : "Failed to process recording"
      );
    }
  };

  useEffect(() => {
    processAudio();
  }, [audioId, outputLanguage]);

  // After getting results show login info if user is not logged in
  const renderAuthInfo = () => {
    if (isAuthLoading) return null;

    if (!isAuthenticated) {
      return <AuthStatus />;
    }

    return null;
  };

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
      <Card className="mb-8 border-destructive shadow-md">
        <CardContent className="pt-6 p-8">
          <h2 className="text-xl font-semibold text-destructive mb-4 text-center">
            An error occurred
          </h2>
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result || !showResults) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin " />
        <span className="ml-2 text-muted-foreground">Loading results...</span>
      </div>
    );
  }

  // Render analysis results if available
  return (
    <div className="space-y-6">
      {renderAuthInfo()}

      {/* Summary always visible on top */}
      <Card className="border shadow-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {result.summary}
          </p>
        </CardContent>
      </Card>

      {/* Tabs for other content */}
      <ResultsTabs result={result} skipSummary={true} />
    </div>
  );
}
