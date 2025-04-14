"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { AudioAnalysisData } from "@/types/analysis";

interface UseAudioAnalysisReturn {
  isLoading: boolean;
  title: string;
  analysis: AudioAnalysisData | null | undefined;
}

export function useAudioAnalysis(audioId: string): UseAudioAnalysisReturn {
  const [isLoading, setIsLoading] = useState(true);
  
  const audioAnalysis = useQuery(api.audio.getAudioAnalysis, { url: audioId });

  const getFormattedTitle = (): string => {
    if (audioAnalysis?.title) {
      const title = audioAnalysis.title;
      return title.replace(/\.[^/.]+$/, "");
    }
    return `Audio ${audioId.substring(0, 8)}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

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