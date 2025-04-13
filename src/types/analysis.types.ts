// Definicje typów używanych w analizie

export type VideoAnalysisResult = {
    title: string;
    summary: string;
    keyPoints: string[]; // Główne tematy/zagadnienia
    actionItems?: { // Zadania do wykonania
      person: string;
      task: string;
      dueDate?: string; // Opcjonalny termin
    }[];
    decisionsMade?: string[]; // Podjęte decyzje
    videoChapters: VideoChapter[]; // Rozdziały wideo
    presentationQuality?: { // Jakość prezentacji/spotkania
      overallClarity: string;
      difficultSegments?: {
        startTime: string; // "hh:mm:ss"
        endTime: string;   // "hh:mm:ss"
        issue: string;     // Opis problemu
        improvement?: string;// Sugestia poprawy
      }[];
      improvementSuggestions?: string[]; // Ogólne sugestie poprawy
    };
    glossary?: Record<string, string>; // Słownik terminów
    // Można dodać opcjonalne pola jak:
    // openQuestions?: string[];
    // sentiment?: string;
  }
  
  export type VideoChapter = {
    startTime: string; // Format "hh:mm:ss"
    endTime: string;   // Format "hh:mm:ss"
    title: string;     // Tytuł rozdziału (np. "Wprowadzenie", "Dyskusja o budżecie", "Q&A")
    description?: string; // Opcjonalny krótki opis zawartości rozdziału
  }
  
  // ParsedAIResponse powinien odzwierciedlać strukturę JSON z promptu
  export interface ParsedAIResponse {
    summary: string;
    keyPoints: string[];
    actionItems?: { person: string; task: string; dueDate?: string; }[];
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
  
  // --- Typy związane z transkrypcją (bez zmian) ---
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