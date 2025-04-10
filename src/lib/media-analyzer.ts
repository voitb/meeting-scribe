import { Transcription, VideoAnalysisResult, analyzeTranscription } from "./analysis-utils";
import { fetchAudioFromYouTube } from "./youtube-audio";
import { withRetry } from "./file-utils";

export type MediaAnalysisInput = {
  sourceUrl: string;
  transcriptionLanguage?: string;
  outputLanguage?: string;
  options?: MediaAnalysisOptions;
};

export type MediaAnalysisOptions = {
  cleanupTempFiles?: boolean;
  maxRetries?: number;
  retryDelay?: number;
};

export enum MediaAnalysisStatus {
  PENDING = "pending",
  DOWNLOADING = "downloading", 
  TRANSCRIBING = "transcribing",
  ANALYZING = "analyzing",
  COMPLETED = "completed",
  FAILED = "failed"
}

export type MediaAnalysisResult = VideoAnalysisResult & {
  sourceUrl: string;
  analysisDate: string;
  status: MediaAnalysisStatus;
  error?: string;
  rawTranscription?: unknown;
};

export async function analyzeMedia(input: MediaAnalysisInput): Promise<MediaAnalysisResult> {
  const {
    sourceUrl,
    transcriptionLanguage = "auto",
    outputLanguage = "english",
    options = {}
  } = input;
  
  const {
    maxRetries = 5,
    retryDelay = 3000
  } = options;
  
  let status: MediaAnalysisStatus = MediaAnalysisStatus.PENDING;
  let error: string | undefined;
  let analysisResult: MediaAnalysisResult | null = null;
  
  try {
    status = MediaAnalysisStatus.DOWNLOADING;
    console.log(`[Media Analyzer] Starting audio download from: ${sourceUrl}`);
    
    const { title, transcription } = await withRetry(
      async () => await fetchAudioFromYouTube(sourceUrl, transcriptionLanguage),
      {
        operationName: "audio download and transcription",
        maxRetries,
        retryDelay
      }
    );
    
    const transcriptionText = (transcription as {text: string}).text;

    status = MediaAnalysisStatus.ANALYZING;
    console.log(`[Media Analyzer] Starting transcription analysis for: ${title}`);
    
    
    if (!transcriptionText) {
      throw new Error("No transcription text to analyze");
    }
    
    const analysis = await withRetry(
      async () => await analyzeTranscription(title, transcription as Transcription, outputLanguage),
      {
        operationName: "transcription analysis",
        maxRetries,
        retryDelay
      }
    );
    
    status = MediaAnalysisStatus.COMPLETED;
    
    analysisResult = {
      ...analysis,
      sourceUrl,
      analysisDate: new Date().toISOString(),
      status,
      rawTranscription: transcription
    };
    
    return analysisResult;
  } catch (e) {
    status = MediaAnalysisStatus.FAILED;
    error = e instanceof Error ? e.message : String(e);
    console.error(`[Media Analyzer] Error during media analysis: ${error}`);
    
    return {
      title: "",
      summary: "",
      keyPoints: [],
      discussionQuestions: [],
      videoChapters: [],
      presentationQuality: {
        overallClarity: "",
        difficultSegments: [],
        improvementSuggestions: []
      },
      glossary: {},
      sourceUrl,
      analysisDate: new Date().toISOString(),
      status,
      error
    };
  }
}