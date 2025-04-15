import { writeFile } from "fs/promises";
import { transcribeAudio, GroqTranscriptionSegment, GroqTranscriptionResponse } from "@/lib/audio-utils";
import { 
  cleanupTempFiles, 
  generateTempFilePath, 
  validateAudioFile, 
  extractAudioFromVideo 
} from "@/lib/file-utils";
import path from "path";
import { 
  getTranscriptionsDir,
  setTranscriptionExpiration,
  cleanupExpiredTranscriptions
} from "@/lib/transcription-manager";

export interface MediaFile {
  name: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export interface MediaDetails {
  title: string;
  originalFileName: string;
  lengthSeconds: string;
  thumbnails: Array<unknown>;
  isVideo: boolean;
}

export type TranscriptionResult = GroqTranscriptionResponse;

export interface TranscriptionWithMetadata {
  task: string;
  language: string;
  duration: number;
  text: string;
  words: Array<{ word: string; start: number; end: number }>;
  segments: Array<{
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
  }>;
  metadata: {
    originalFileName: string;
    processingDate: string;
    fileSize: number;
    isVideo: boolean;
  };
  [key: string]: unknown;
}

export interface AnalysisResult {
  audioId: string;
  audioDetails: MediaDetails;
  transcription: TranscriptionWithMetadata;
}

export async function scheduleAutoCleanup(): Promise<void> {
  setTimeout(async () => {
    try {
      const result = await cleanupExpiredTranscriptions();
      console.log(`Auto cleanup completed: ${result.deleted} files removed, ${result.keptCount} kept`);
    } catch (cleanupError) {
      console.error("Error during automatic transcription cleanup:", cleanupError);
    }
  }, 100);
}

export async function processMediaFile(
  mediaFile: MediaFile, 
  isVideo: boolean
): Promise<AnalysisResult> {
  try {
    await cleanupExpiredTranscriptions();
  } catch (error) {
    console.error("Error cleaning up expired transcriptions:", error);
  }

  const originalFileName = mediaFile.name;
  console.log(`Processing ${isVideo ? 'video' : 'audio'} file: ${originalFileName}`);

  const bytes = await mediaFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Save file temporarily
  const tempBasePath = generateTempFilePath(isVideo ? "video-upload" : "audio-upload");
  const fileExtension = originalFileName.split('.').pop() || (isVideo ? 'mp4' : 'mp3');
  const tempFilePath = `${tempBasePath}.${fileExtension}`;
  
  let audioFilePath = tempFilePath;
  const filesToCleanup = [tempFilePath];
  
  try {
    await writeFile(tempFilePath, buffer);
    console.log("File saved successfully:", tempFilePath);
    
    // If this is a video file, extract the audio track
    if (isVideo) {
      console.log("Extracting audio from video file...");
      const extractedAudioPath = `${tempBasePath}-audio.mp3`;
      filesToCleanup.push(extractedAudioPath);
      
      try {
        await extractAudioFromVideo(tempFilePath, extractedAudioPath);
        console.log("Audio extracted successfully:", extractedAudioPath);
        audioFilePath = extractedAudioPath;
      } catch (extractError) {
        console.error("Error extracting audio:", extractError);
        throw new Error("Failed to extract audio from video file");
      }
    }
    
    const validatedFilePath = validateAudioFile(audioFilePath);
    
    const audioId = Date.now().toString();
    
    console.log("Starting audio transcription...");
    const transcriptionResult = await transcribeAudio(validatedFilePath);
    console.log("Transcription completed successfully!");
    
    // Simplify transcription segments
    const simplifiedTranscription = simplifyTranscription(transcriptionResult);
    
    // Add metadata including original filename
    const transcriptionWithMetadata = addMetadata(simplifiedTranscription, mediaFile, isVideo);
    
    // Save transcription to disk for later use
    await saveTranscription(audioId, transcriptionWithMetadata);
    
    // Create audio metadata
    const mediaDetails = createMediaDetails(originalFileName, isVideo, transcriptionResult.duration);
    
    // Clean up temporary files
    cleanupTempFiles(filesToCleanup);
    
    console.log("Analysis completed successfully, returning results");
    return {
      audioId,
      audioDetails: mediaDetails,
      transcription: transcriptionWithMetadata
    };
  } catch (error) {
    // Clean up temporary files in case of error
    cleanupTempFiles(filesToCleanup);
    throw error;
  }
}

function simplifyTranscription(transcription: TranscriptionResult): TranscriptionResult {
  const simplifiedTranscription = { ...transcription };
  
  if (simplifiedTranscription.segments && Array.isArray(simplifiedTranscription.segments)) {
    simplifiedTranscription.segments = simplifiedTranscription.segments.map(
      (segment: GroqTranscriptionSegment) => ({
        ...segment,
        start: Math.floor(segment.start),
        end: Math.floor(segment.end)
      })
    );
  }
  
  return simplifiedTranscription;
}

function addMetadata(
  transcription: TranscriptionResult, 
  mediaFile: MediaFile, 
  isVideo: boolean
): TranscriptionWithMetadata {
  return {
    ...transcription,
    metadata: {
      originalFileName: mediaFile.name,
      processingDate: new Date().toISOString(),
      fileSize: mediaFile.size,
      isVideo: isVideo
    }
  } as TranscriptionWithMetadata;
}

async function saveTranscription(audioId: string, transcription: TranscriptionWithMetadata): Promise<void> {
  const transcriptionsDir = await getTranscriptionsDir();
  const transcriptionFilePath = path.join(transcriptionsDir, `${audioId}.json`);
  
  await writeFile(
    transcriptionFilePath, 
    JSON.stringify(transcription, null, 2)
  );
  
  console.log(`Saved transcription to file: ${transcriptionFilePath}`);
  
  await setTranscriptionExpiration(transcriptionFilePath);
}

function createMediaDetails(
  originalFileName: string, 
  isVideo: boolean, 
  duration: number = 0
): MediaDetails {
  return {
    title: originalFileName,
    originalFileName: originalFileName,
    lengthSeconds: Math.ceil(duration || 0).toString(),
    thumbnails: [],
    isVideo: isVideo
  };
} 