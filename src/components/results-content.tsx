"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import ResultsTabs from "./results-tab";
import type { VideoChapter } from "./video-chapters";

export interface DifficultSegment {
  timeRange: string;
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
  discussionQuestions: string[];
  transcription?: string;
  videoChapters?: VideoChapter[];
  presentationQuality?: PresentationQuality;
  glossary?: Record<string, string>;
  analysisDate?: string;
}

export default function ResultsContent({ videoId }: { videoId: string }) {
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get language from URL query parameter, default to Polish if not provided
  const outputLanguage = searchParams.get("lang") || "polish";

  const steps = [
    "Downloading audio",
    "Creating transcription",
    "Analyzing text",
    "Preparing results",
  ];

  useEffect(() => {
    const processVideo = async () => {
      try {
        // Reset state
        setProcessing(true);
        setCurrentStep(0);
        setProgress(0);
        setResult(null);
        setError(null);

        // Step 1: Download audio and transcribe
        setCurrentStep(1);
        setProgress(25);

        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const transcriptionResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: youtubeUrl,
            language: "auto", // Default auto
          }),
        });

        if (!transcriptionResponse.ok) {
          const errorData = await transcriptionResponse.json();
          throw new Error(errorData.error || "Error during transcription");
        }

        const transcriptionData = await transcriptionResponse.json();

        // Step 2: Transcription complete
        setCurrentStep(2);
        setProgress(50);

        // Step 3: Text analysis
        const analyzeResponse = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...transcriptionData,
            outputLanguage,
          }),
        });

        if (!analyzeResponse.ok) {
          const errorData = await analyzeResponse.json();
          throw new Error(errorData.error || "Error during analysis");
        }

        // Step 4: Prepare results
        setCurrentStep(3);
        setProgress(75);

        const analysisData = await analyzeResponse.json();
        console.log(analysisData);
        // Finalize
        setProgress(100);
        setResult({
          title: transcriptionData.title,
          summary: analysisData.summary,
          keyPoints: analysisData.keyPoints,
          discussionQuestions: analysisData.discussionQuestions,
          transcription: transcriptionData.transcription,
          videoChapters: analysisData.videoChapters,
          presentationQuality: analysisData.presentationQuality,
          glossary: analysisData.glossary,
        });

        toast.success("Analysis completed successfully!");
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        toast.error("An error occurred during analysis");
      } finally {
        setProcessing(false);
      }
    };

    processVideo();
  }, [videoId, outputLanguage]);

  if (processing) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Progress</h2>
          <Progress value={progress} className="h-2 mb-4" />
          <p className="text-center text-sm text-muted-foreground">
            {steps[currentStep]} ({Math.round(progress)}%)
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 border-destructive">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-destructive mb-4">
            An Error Occurred
          </h2>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text" />
        <span className="ml-2">Loading results...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Generated Educational Materials
        </h2>
        <div className="text-sm px-3 py-1 bg-accent/10 rounded-full">
          {outputLanguage.charAt(0).toUpperCase() + outputLanguage.slice(1)}
        </div>
      </div>
      <ResultsTabs result={result} />
    </div>
  );
}
