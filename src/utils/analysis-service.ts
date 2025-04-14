import { initializeProgress } from "@/lib/progress-store";
import { analyzeTranscription } from "@/lib/services/analysis-service";
import { SummarizeRequestData, EnhancedAnalysisResult, Transcription } from "@/types/api";

/**
 * Extracts audio identifier from request data
 */
export function extractAudioId(data: SummarizeRequestData): string | undefined {
  return data.audioId || data.videoDetails?.id || data.audioDetails?.id;
}

/**
 * Extracts title from request data
 */
export function extractTitle(data: SummarizeRequestData): string {
  return data.videoDetails?.title || data.audioDetails?.title || "Untitled Recording";
}

/**
 * Extracts original filename from request data
 */
export function extractOriginalFileName(data: SummarizeRequestData): string | undefined {
  return data.audioDetails?.originalFileName || data.videoDetails?.originalFileName;
}

/**
 * Validates transcription data
 */
export function validateTranscription(transcription: Transcription): void {
  if (!transcription || !transcription.text) {
    throw new Error("No transcription text to analyze");
  }
}

/**
 * Processes transcription analysis request
 */
export async function processAnalysisRequest(
  data: SummarizeRequestData,
  userId?: string
): Promise<EnhancedAnalysisResult> {
  const title = extractTitle(data);
  const audioId = extractAudioId(data);
  const originalFileName = extractOriginalFileName(data);
  const outputLanguage = data.outputLanguage || "english";
  
  if (originalFileName) {
    console.log(`Original filename preserved: ${originalFileName}`);
  }
  
  console.log(`User ID: ${userId || 'not logged in'}`);
  
  if (!audioId) {
    console.error("Missing audio identifier for progress tracking");
  }
     
  validateTranscription(data.transcription);
  
  console.log("Starting transcription analysis...");
  
  if (audioId) {
    console.log(`Initializing progress tracking for audioId: ${audioId}`);
    initializeProgress(audioId);
  }
  
  const analysisResult = await analyzeTranscription(
    title,
    data.transcription,
    outputLanguage,
    audioId
  );

  return {
    ...analysisResult,
    title,
    analysisDate: new Date().toISOString(),
    userId,
    sourceUrl: audioId,
    originalFileName: originalFileName || title
  };
} 