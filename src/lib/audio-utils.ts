import Groq from "groq-sdk";
import fs from "fs";

export type ResponseFormat = "verbose_json" | "json" | "text";
export type TimestampGranularity = "word" | "segment";

export interface GroqTranscriptionWord {
  word: string;
  start: number;
  end: number;
}

export interface GroqTranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface GroqTranscriptionResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  words: GroqTranscriptionWord[];
  segments: GroqTranscriptionSegment[];
  x_groq?: {
    id: string;
  };
}

/**
 * Transcribes audio file using Whisper model from Groq
 * Groq API automatically detects recording language
 */
export async function transcribeAudio(audioFilePath: string): Promise<GroqTranscriptionResponse> {
  const groq = new Groq();
  
  // Whisper model in Groq automatically detects language
  const transcriptionOptions = {
    file: fs.createReadStream(audioFilePath),
    model: "whisper-large-v3-turbo",
    prompt: "Specify context or spelling",
    response_format: "verbose_json" as ResponseFormat,
    timestamp_granularities: ["word", "segment"] as TimestampGranularity[],
    // Not passing language parameter to avoid errors
    // Groq API will auto-detect language
  };
  
  return await groq.audio.transcriptions.create(transcriptionOptions) as GroqTranscriptionResponse;
}