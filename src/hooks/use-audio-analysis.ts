"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface UseAudioAnalysisReturn {
  isLoading: boolean;
  title: string;
  analysis: AudioAnalysisData | null | undefined;
}

// Define a proper type for the Convex data
interface AudioAnalysisData {
  title?: string;
  summary?: string;
  keyPoints?: string[];
  meetingOutcomes?: string[];
  audioChapters?: Array<{
    startTime: string;
    endTime: string;
    title: string;
    description: string;
  }>;
  presentationQuality?: {
    overallClarity: string;
    difficultSegments: Array<{
      startTime: string;
      endTime: string;
      issue: string;
      improvement: string;
    }>;
    improvementSuggestions: string[];
  };
  glossary?: Record<string, string>;
  analysisDate?: string;
}

/**
 * Hook for fetching and managing audio analysis data
 */
export function useAudioAnalysis(audioId: string): UseAudioAnalysisReturn {
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data from Convex
  const audioAnalysis = useQuery(api.audio.getAudioAnalysis, { url: audioId });

  // Format the audio title using data from Convex
  const getFormattedTitle = (): string => {
    if (audioAnalysis?.title) {
      // Use title from database, but remove file extension
      const title = audioAnalysis.title;
      return title.replace(/\.[^/.]+$/, "");
    }
    return `Audio ${audioId.substring(0, 8)}`;
  };

  useEffect(() => {
    // Set loading as complete when we have data from Convex or after 1.5s
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // If Convex data is available sooner, don't wait
    if (audioAnalysis !== undefined) {
      setIsLoading(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [audioId, audioAnalysis]);

  return {
    isLoading,
    title: getFormattedTitle(),
    analysis: audioAnalysis,
  };
} 