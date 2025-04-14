import path from "path";
import fs from "fs/promises";
import { getTranscriptionsDir } from "@/lib/transcription-manager";
import { Transcription, TranscriptionResponse } from "@/types/api";
import { fileExists } from "./audio-metadata";

/**
 * Creates a default transcription for cases when the actual one is not available
 */
export function createDemoTranscription(audioId: string): Transcription {
  return {
    task: "transcribe",
    language: "en",
    duration: 125.88,
    text: `This is a sample transcription for audio file with ID ${audioId}. The actual transcription was not found.`,
    segments: [
      {
        id: 0,
        seek: 0,
        start: 0,
        end: 10,
        text: "This is a sample transcription for the audio file.",
        tokens: [],
        temperature: 0,
        avg_logprob: 0,
        compression_ratio: 0,
        no_speech_prob: 0
      }
    ],
    words: []
  };
}

/**
 * Creates a transcription for error cases
 */
export function createErrorTranscription(): Transcription {
  return {
    task: "transcribe",
    language: "en",
    duration: 125.88,
    text: "This is a sample transcription. The actual transcription could not be retrieved due to an error.",
    segments: [
      {
        id: 0,
        seek: 0,
        start: 0,
        end: 10,
        text: "This is a sample transcription. An error occurred.",
        tokens: [],
        temperature: 0,
        avg_logprob: 0,
        compression_ratio: 0,
        no_speech_prob: 0
      }
    ],
    words: []
  };
}

/**
 * Fetches a transcription from the file system based on audioId
 */
export async function fetchTranscription(audioId: string): Promise<TranscriptionResponse> {
  // Get transcriptions directory
  const transcriptionsDir = await getTranscriptionsDir();

  // Path to transcription file
  const transcriptionFilePath = path.join(transcriptionsDir, `${audioId}.json`);
  
  // Default transcription
  const demoTranscription = createDemoTranscription(audioId);
  
  // Check if file exists
  const exists = await fileExists(transcriptionFilePath);
  if (!exists) {
    console.log(`Transcription file does not exist: ${transcriptionFilePath}, returning sample transcription`);
    return { transcription: demoTranscription };
  }
  
  try {
    // Read transcription file contents
    const transcriptionContent = await fs.readFile(transcriptionFilePath, 'utf-8');
    const parsedData = JSON.parse(transcriptionContent);
    
    // Extract the transcription from the parsed data - it might be nested
    const transcription = parsedData.transcription || parsedData;
    
    if (!transcription || Object.keys(transcription).length === 0) {
      console.log(`Transcription content is empty for: ${audioId}`);
      return { transcription: demoTranscription };
    }
    
    console.log("Successfully retrieved transcription");
    return { 
      transcription: transcription as Transcription 
    };
  } catch (readError) {
    console.error(`Error reading or parsing transcription file: ${transcriptionFilePath}`, readError);
    return { transcription: demoTranscription };
  }
} 