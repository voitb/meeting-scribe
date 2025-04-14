// Type definitions used in analysis

export type VideoAnalysisResult = {
    title: string;
    summary: string;
    keyPoints: string[]; // Main topics/issues
    actionItems?: { // Tasks to complete
      task: string;
      dueDate?: string; // Optional deadline
    }[];
    decisionsMade?: string[]; // Decisions made
    videoChapters: VideoChapter[]; // Video chapters
    presentationQuality?: { // Presentation/meeting quality
      overallClarity: string;
      difficultSegments?: {
        startTime: string; // "hh:mm:ss"
        endTime: string;   // "hh:mm:ss"
        issue: string;     // Problem description
        improvement?: string;// Improvement suggestion
      }[];
      improvementSuggestions?: string[]; // General improvement suggestions
    };
    glossary?: Record<string, string>; // Term dictionary
    // Optional fields can be added like:
    // openQuestions?: string[];
    // sentiment?: string;
  }
  
  export type VideoChapter = {
    startTime: string; // Format "hh:mm:ss"
    endTime: string;   // Format "hh:mm:ss"
    title: string;     // Chapter title (e.g. "Introduction", "Budget Discussion", "Q&A")
    description?: string; // Optional short description of chapter content
  }
  
  // ParsedAIResponse should reflect the JSON structure from the prompt
  export interface ParsedAIResponse {
    summary: string;
    keyPoints: string[];
    actionItems?: { task: string; dueDate?: string; }[];
    decisionsMade?: string[];
    videoChapters: VideoChapter[];
    presentationQuality?: {
      overallClarity: string;
      difficultSegments?: { startTime: string; endTime: string; issue: string; improvement?: string; }[];
      improvementSuggestions?: string[];
    };
    glossary?: Record<string, string>;
    [key: string]: unknown; // Allow for flexibility if AI adds extra fields
  }
  
  // --- Transcription related types (unchanged) ---
  export interface Transcription {
    task: string;
    language: string;
    duration: number;
    text: string;
    words: Word[];
    segments: Segment[];
    x_groq?: { // Optional metadata
        id: string;
    };
  }
  
  export interface Word {
    word: string;
    start: number; // seconds
    end: number;   // seconds
  }
  
  export interface Segment {
    id: number;
    seek: number;
    start: number; // seconds
    end: number;   // seconds
    text: string;
    tokens?: number[]; // Optional
    temperature?: number; // Optional
    avg_logprob?: number; // Optional
    compression_ratio?: number; // Optional
    no_speech_prob?: number; // Optional
  }