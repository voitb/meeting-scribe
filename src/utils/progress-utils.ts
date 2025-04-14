import { AnalysisProgress } from "@/types/progress";

/**
 * Calculates the overall progress percentage for audio analysis
 */
export function calculateOverallProgress(progress: AnalysisProgress): number {
  let overallProgress = 0;
  
  if (progress.status === 'pending') {
    overallProgress = 0;
  } else if (progress.status === 'processing') {
    if (progress.totalChunks > 1) {
      const chunksCompleted = progress.currentChunk - 1;
      const chunksCompletedPercent = (chunksCompleted / progress.totalChunks) * 100;
      const currentChunkPercent = (progress.chunkProgress / 100) * (100 / progress.totalChunks);
      overallProgress = chunksCompletedPercent + currentChunkPercent;
    } else {
      overallProgress = progress.chunkProgress;
    }
  } else if (progress.status === 'completed') {
    overallProgress = 100;
  }
  
  return Math.round(overallProgress);
} 