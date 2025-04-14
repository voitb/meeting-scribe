import path from "path";
import fs from "fs/promises";
import { getTranscriptionsDir } from "@/lib/transcription-manager";
import { AudioMetadataResponse } from "@/types/api";

interface TranscriptionData {
  duration?: number;
  language?: string;
  metadata?: {
    originalFileName?: string;
    processingDate?: string;
    fileSize?: number;
  };
  audioDetails?: {
    originalFileName?: string;
  };
  [key: string]: unknown;
}

/**
 * Creates default metadata for an audio file
 */
export function createDefaultMetadata(audioId: string): AudioMetadataResponse {
  return {
    audioId,
    originalFileName: `recording-${audioId}.mp3`,
    metadata: {
      duration: 0,
      language: 'en',
      processingDate: new Date().toISOString(),
      fileSize: 0
    }
  };
}

/**
 * Checks if a file exists without throwing an exception
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts original filename from transcription data
 */
export function extractOriginalFilename(transcription: TranscriptionData, audioId: string): string {
  let originalFileName = null;
  
  if (transcription.metadata && transcription.metadata.originalFileName) {
    originalFileName = transcription.metadata.originalFileName;
  } else if (transcription.audioDetails && transcription.audioDetails.originalFileName) {
    originalFileName = transcription.audioDetails.originalFileName;
  }
  
  return originalFileName || `recording-${audioId}.mp3`;
}

/**
 * Fetches audio metadata from transcription file
 */
export async function fetchAudioMetadata(audioId: string): Promise<AudioMetadataResponse> {
  // Get transcriptions directory
  const transcriptionsDir = await getTranscriptionsDir();

  // Path to transcription file which contains metadata
  const transcriptionFilePath = path.join(transcriptionsDir, `${audioId}.json`);
  
  // Default metadata in case file doesn't exist
  const defaultMetadata = createDefaultMetadata(audioId);
  
  // Check if file exists
  const exists = await fileExists(transcriptionFilePath);
  if (!exists) {
    console.log(`Transcription file not found: ${transcriptionFilePath}, returning default metadata`);
    return defaultMetadata;
  }
  
  try {
    // Read file to get metadata
    const transcriptionData = await fs.readFile(transcriptionFilePath, 'utf-8');
    const transcription = JSON.parse(transcriptionData) as TranscriptionData;
    
    // Extract original filename
    const originalFileName = extractOriginalFilename(transcription, audioId);
    console.log(`Retrieved original filename for ${audioId}: ${originalFileName}`);
    
    return {
      audioId,
      originalFileName,
      metadata: {
        duration: transcription.duration || 0,
        language: transcription.language || 'en',
        processingDate: transcription.metadata?.processingDate || new Date().toISOString(),
        fileSize: transcription.metadata?.fileSize || 0
      }
    };
  } catch (err) {
    // Handle errors in metadata processing
    console.error(`Error processing metadata for: ${audioId}`, err);
    return defaultMetadata;
  }
} 