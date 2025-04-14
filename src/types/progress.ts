export interface AnalysisProgress {
  audioId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  currentStep: number; 
  totalChunks: number;
  currentChunk: number;
  chunkProgress: number;
  message: string;
  error?: string;
  updatedAt: Date;
} 