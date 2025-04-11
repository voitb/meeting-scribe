"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import type { VideoChapter } from "./video-chapters";
import ResultsTabs from "./results-tab";
import { ProgressCards } from "./progress-cards";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { thumbnail } from "@distube/ytdl-core";

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
  thumbnail?: string;
  summary: string;
  keyPoints: string[];
  videoChapters?: VideoChapter[];
  presentationQuality?: PresentationQuality;
  glossary?: Record<string, string>;
  analysisDate?: string;
}

function getThumbnailUrl(thumbnails: thumbnail[]): string {
  if (thumbnails && thumbnails.length > 0) {
    const sortedThumbnails = [...thumbnails].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );

    return sortedThumbnails[0].url;
  }

  return "";
}

export default function ResultsContent({ videoId }: { videoId: string }) {
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Get language from URL query parameter, default to Polish if not provided
  const outputLanguage = searchParams.get("lang") || "polish";
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Sprawdzenie czy wideo istnieje już w bazie danych
  const existingVideo = useQuery(api.videos.getVideoAnalysis, {
    url: youtubeUrl,
  });

  // Mutacja do dodawania nowej analizy wideo
  const addVideoAnalysis = useMutation(api.videos.addVideoAnalysis);

  console.log({ existingVideo });

  useEffect(() => {
    if (existingVideo === undefined) {
      return;
    }

    if (existingVideo) {
      setCurrentStep(3);

      const finalResult: AnalysisResult = {
        title: existingVideo.title,
        thumbnail: existingVideo.thumbnail,
        summary: existingVideo.summary,
        keyPoints: existingVideo.keyPoints,
        videoChapters: existingVideo.videoChapters,
        presentationQuality: existingVideo.presentationQuality,
        glossary: existingVideo.glossary,
        analysisDate: existingVideo.analysisDate,
      };

      setResult(finalResult);

      setTimeout(() => {
        setShowResults(true);
        setProcessing(false);
        toast.success("Analysis already exists!");
      }, 1000);

      return;
    }

    const processVideo = async () => {
      try {
        // Reset state
        setProcessing(true);
        setCurrentStep(0);
        setResult(null);
        setError(null);
        setShowResults(false);

        // Step 1: Download audio and transcribe
        setCurrentStep(0); // First step (25%)

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
        setCurrentStep(1); // Second step (50%)

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

        // Step 3: Analyzing content
        setCurrentStep(2); // Third step (75%)

        const analysisData = await analyzeResponse.json();

        // Step 4: Complete
        setCurrentStep(3); // Final step (100%)
        console.log({ transcriptionData, analysisData });
        // Prepare the result
        const finalResult = {
          title: transcriptionData.videoDetails.title,
          thumbnail: getThumbnailUrl(transcriptionData.videoDetails.thumbnails),
          summary: analysisData.summary,
          keyPoints: analysisData.keyPoints,
          videoChapters: analysisData.videoChapters,
          presentationQuality: analysisData.presentationQuality,
          glossary: analysisData.glossary,
          analysisDate: new Date().toISOString(),
        };

        setResult(finalResult);

        try {
          await addVideoAnalysis({
            url: youtubeUrl,
            ...finalResult,
          });

          console.log("Analiza została zapisana w bazie danych");
        } catch (dbError) {
          console.error(
            "Błąd podczas zapisywania analizy w bazie danych:",
            dbError
          );
          // Nie przerywamy działania aplikacji, jeśli zapis do bazy się nie powiedzie
        }

        // Show completion card for 2 seconds before showing results
        setTimeout(() => {
          setShowResults(true);
          setProcessing(false);
          toast.success("Analysis completed successfully!");
        }, 2000);
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        toast.error("An error occurred during analysis");
        setProcessing(false);
      }
    };

    processVideo();
  }, [videoId, outputLanguage, existingVideo, youtubeUrl, addVideoAnalysis]);

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
            An Error Occurred
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

  return (
    <AnimatePresence>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Generated Educational Materials
          </h2>
          {/* <div className="text-sm px-3 py-1 bg-accent/10 rounded-full ">
            {outputLanguage.charAt(0).toUpperCase() + outputLanguage.slice(1)}
          </div> */}
        </div>
        <ResultsTabs result={result} />
      </motion.div>
    </AnimatePresence>
  );
}
