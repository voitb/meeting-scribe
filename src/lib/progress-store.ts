import { AnalysisProgress } from "@/types/progress";

// Simple in-memory progress store
const progressStore = new Map<string, AnalysisProgress>();

// Initialize progress for new audio
export function initializeProgress(audioId: string): AnalysisProgress {
  const progress: AnalysisProgress = {
    audioId,
    status: 'pending',
    currentStep: 0,
    totalChunks: 1,
    currentChunk: 0,
    chunkProgress: 0,
    message: 'Waiting to start analysis...',
    updatedAt: new Date()
  };
  
  progressStore.set(audioId, progress);
  return progress;
}

// Update analysis progress
export function updateProgress(
  audioId: string, 
  update: Partial<AnalysisProgress>
): AnalysisProgress {
  const currentProgress = progressStore.get(audioId);
  
  if (!currentProgress) {
    throw new Error(`Progress not found for ID: ${audioId}`);
  }
  
  const updatedProgress = {
    ...currentProgress,
    ...update,
    updatedAt: new Date()
  };
  
  progressStore.set(audioId, updatedProgress);
  return updatedProgress;
}

// Update transcription chunk progress
export function updateChunkProgress(
  audioId: string,
  currentChunk: number,
  totalChunks: number,
  chunkProgress: number = 0,
  message: string = ''
): AnalysisProgress {
  const formattedMessage = message || `Analyzing part ${currentChunk}/${totalChunks}`;
  
  return updateProgress(audioId, {
    status: 'processing',
    currentStep: 1,
    totalChunks,
    currentChunk,
    chunkProgress,
    message: formattedMessage
  });
}

// Get current progress
export function getProgress(audioId: string): AnalysisProgress | null {
  return progressStore.get(audioId) || null;
}

// Mark analysis as completed
export function markAsCompleted(audioId: string, message: string = 'Analysis completed successfully'): AnalysisProgress {
  return updateProgress(audioId, {
    status: 'completed',
    currentStep: 3,
    chunkProgress: 100,
    message
  });
}

// Mark analysis as error
export function markAsError(audioId: string, error: string): AnalysisProgress {
  return updateProgress(audioId, {
    status: 'error',
    error,
    message: `Analysis error: ${error}`
  });
}

// Cleanup inactive progress entries
export function cleanupOldProgress(maxAgeMinutes: number = 60): void {
  const now = new Date();
  
  progressStore.forEach((progress, audioId) => {
    const ageInMs = now.getTime() - progress.updatedAt.getTime();
    const ageInMinutes = ageInMs / (1000 * 60);
    
    if (ageInMinutes > maxAgeMinutes) {
      progressStore.delete(audioId);
    }
  });
}