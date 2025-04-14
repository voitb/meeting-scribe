import type { VideoChapter } from "@/components/video-chapters";

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

export interface ActionItem {
  task: string;
  dueDate?: string;
}

export interface AnalysisResult {
  title?: string;
  summary: string;
  keyPoints: string[];
  decisionsMade?: string[];
  actionItems?: ActionItem[];
  videoChapters?: VideoChapter[];
  presentationQuality?: PresentationQuality;
  glossary?: Record<string, string>;
  analysisDate?: string;
}

export type AnalysisStatus = "loading" | "processing" | "completed" | "ready";

export interface AnalysisStep {
  name: string;
  progress: number;
}

export interface AudioAnalysisData {
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