"use client";

import { useState, useEffect, useCallback } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import type { 
  AnalysisResult,
  AnalysisStatus,
  AnalysisStep
} from "@/types/analysis";
import { deleteTranscriptionFile } from "@/lib/transcription-utils";

interface UseAnalysisProcessorProps {
  audioId: string;
  language?: string;
}

interface UseAnalysisProcessorReturn {
  result: AnalysisResult | null;
  processing: boolean;
  currentStep: number;
  startTime: number;
  error: string | null;
  showResults: boolean;
  dataSource: "api" | "database";
  analysisStatus: AnalysisStatus;
  steps: AnalysisStep[];
}

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { name: "Loading transcription", progress: 10 },
  { name: "Processing audio", progress: 40 },
  { name: "Analysis completed", progress: 90 },
  { name: "Preparing results", progress: 100 },
];

export function useAnalysisProcessor({ 
  audioId, 
  language = "english" 
}: UseAnalysisProcessorProps): UseAnalysisProcessorReturn {
  const [processing, setProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [dataSource, setDataSource] = useState<"api" | "database">("api");
  const [shouldRunAnalysis, setShouldRunAnalysis] = useState<boolean | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("loading");

  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const userAnalysis = useQuery(api.audio.getAudioAnalysis, { url: audioId });
  const updateAudioAnalysis = useMutation(api.audio.updateAudioAnalysis);

  

  const saveAnalysisToConvex = useCallback(async (analysisResult: AnalysisResult) => {
    if (!isAuthenticated) return;

    try {
      await updateAudioAnalysis({
        url: audioId,
        title: analysisResult.title || `Audio ${audioId.substring(0, 8)}`,
        summary: analysisResult.summary,
        keyPoints: analysisResult.keyPoints,
        meetingOutcomes: analysisResult.decisionsMade || [],
        audioChapters:
          analysisResult.videoChapters?.map((chapter) => ({
            startTime: chapter.startTime || "00:00:00",
            endTime: chapter.endTime || "00:00:00",
            title: chapter.title,
            description: chapter.description || "",
          })) || [],
        presentationQuality: {
          overallClarity:
            analysisResult.presentationQuality?.overallClarity || "",
          difficultSegments:
            analysisResult.presentationQuality?.difficultSegments?.map(
              (segment) => ({
                startTime: segment.startTime,
                endTime: segment.endTime,
                issue: segment.issue,
                improvement: segment.improvement || "",
              })
            ) || [],
          improvementSuggestions:
            analysisResult.presentationQuality?.improvementSuggestions || [],
        },
        glossary: analysisResult.glossary || {},
        analysisDate: new Date().toISOString(),
      });
    } catch {
      toast.error("Failed to save analysis to database");
    }
  }, [isAuthenticated, audioId, updateAudioAnalysis]);

  const processAudio = useCallback(async () => {
    if (!audioId) return;

    try {
      setAnalysisStatus("processing");
      setCurrentStep(1);

      const transcriptionRes = await fetch(`/api/get-transcription/${audioId}`);

      if (!transcriptionRes.ok) {
        const errorText = await transcriptionRes.text().catch(() => "");
        throw new Error(
          `Failed to fetch transcription (${transcriptionRes.status}). ${errorText ? `Details: ${errorText}` : "Please try again."}`
        );
      }

      const transcriptionData = await transcriptionRes.json().catch(() => {
        throw new Error("Failed to process server response. Transcription data format is invalid.");
      });

      if (!transcriptionData.transcription) {
        throw new Error("No transcription found for this audio file. Please try again later.");
      }

      const { transcription } = transcriptionData;

      const metadataRes = await fetch(`/api/get-audio-metadata/${audioId}`);
      let originalFileName = null;

      if (metadataRes.ok) {
        try {
          const metadata = await metadataRes.json();
          originalFileName = metadata.originalFileName;
        } catch {
          console.warn("Failed to read audio metadata");
          // Non-critical error, continue with default filename
        }
      }

      setCurrentStep(2);

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
          outputLanguage: language,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `Analysis failed (${response.status}). ${errorText ? `Details: ${errorText}` : "Please try again later."}`
        );
      }

      const analysisResult = await response.json().catch(() => {
        throw new Error("Failed to process server response. Analysis data format is invalid.");
      });
      
      setCurrentStep(3);
      setResult(analysisResult);
      setDataSource("api");

      try {
        await saveAnalysisToConvex(analysisResult);
      } catch (convexError) {
        console.error("Error saving to database:", convexError);
        toast.error("Failed to save analysis in database, but you can still view the results");
      }

      setAnalysisStatus("completed");

      if (isAuthenticated && dataSource === "api") {
        try {
          setTimeout(async () => {
            await deleteTranscriptionFile(audioId);
          }, 5000);
        } catch (deleteError) {
          console.warn("Error deleting transcription file:", deleteError);
          // Non-critical error, don't interrupt the flow
        }
      }

      setTimeout(() => {
        setProcessing(false);
        setShowResults(true);
        setAnalysisStatus("ready");
        setCurrentStep(3);
      }, 1500);
    } catch (error) {
      console.error("Error during audio analysis:", error);
      setError(
        `An error occurred during audio analysis: ${
          error instanceof Error ? error.message : "Unknown error. Please try again."
        }`
      );
      setProcessing(false);
      setAnalysisStatus("error");
      toast.error("Analysis failed. Please try again.");
    }
  }, [audioId, isAuthenticated, dataSource, language, saveAnalysisToConvex]);

  useEffect(() => {
    if (!isAuthLoading && userAnalysis !== undefined) {
      if (
        userAnalysis &&
        userAnalysis.summary &&
        userAnalysis.summary !== "Processing..."
      ) {
        setDataSource("database");
        setAnalysisStatus("completed");
        setCurrentStep(3);

        setTimeout(() => {
          setResult({
            title: userAnalysis.title || "",
            summary: userAnalysis.summary,
            keyPoints: userAnalysis.keyPoints || [],
            actionItems: [],
            decisionsMade: userAnalysis.meetingOutcomes || [],
            videoChapters: userAnalysis.audioChapters || [],
            presentationQuality: userAnalysis.presentationQuality || {
              overallClarity: "",
              difficultSegments: [],
              improvementSuggestions: [],
            },
            glossary: userAnalysis.glossary || {},
          });
          setProcessing(false);
          setShowResults(true);
          setAnalysisStatus("ready");
          setCurrentStep(3);
        }, 1500);

        setShouldRunAnalysis(false);
      } else {
        setShouldRunAnalysis(true);
      }
    }
  }, [userAnalysis, isAuthLoading]);

  useEffect(() => {
    if (shouldRunAnalysis === true) {
      processAudio();
    }
  }, [shouldRunAnalysis, processAudio]);

  return {
    result,
    processing,
    currentStep,
    startTime,
    error,
    showResults,
    dataSource,
    analysisStatus,
    steps: ANALYSIS_STEPS,
  };
} 