import { getProgress } from "@/lib/progress-store";
import { calculateOverallProgress } from "@/utils/progress-utils";
import { createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export type ProgressResponseData = {
  audioId: string;
  status: string;
  currentStep: number;
  totalChunks: number;
  currentChunk: number;
  chunkProgress: number;
  message: string;
  overallProgress: number;
  error?: string;
};

export async function handleProgressRequest(audioId: string): Promise<NextResponse> {
  if (!audioId) {
    return createErrorResponse("Audio ID is required", 400);
  }

  const progress = getProgress(audioId);
  
  if (!progress) {
    return createErrorResponse("No analysis progress information found for the given ID", 404);
  }

  const overallProgress = calculateOverallProgress(progress);

  console.log(`Progress for audioId ${audioId}:`, { 
    status: progress.status,
    currentStep: progress.currentStep,
    currentChunk: progress.currentChunk,
    totalChunks: progress.totalChunks,
    chunkProgress: progress.chunkProgress,
    overallProgress
  });

  return createApiResponse({
    ...progress,
    overallProgress
  });
} 