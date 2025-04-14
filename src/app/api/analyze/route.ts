import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { transcribeAudio, GroqTranscriptionSegment } from "@/lib/audio-utils";
import { writeFile } from "fs/promises";
import { cleanupTempFiles, generateTempFilePath, validateAudioFile, extractAudioFromVideo } from "@/lib/file-utils";
import path from "path";
import { ensureTranscriptionsDir, getTranscriptionsDir, cleanupOldTranscriptions } from "@/lib/transcription-manager";

// Ensure transcriptions directory exists
// This is called at the top level of the file, so we'll handle it in a self-invoking async function
(async () => {
  try {
    await ensureTranscriptionsDir();
  } catch (error) {
    console.error("Error ensuring transcriptions directory:", error);
  }
})();

// Cleanup old transcriptions periodically
const AUTO_CLEANUP_AGE_HOURS = 48; // Keep transcriptions for 48 hours by default

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  // Check if it's multipart/form-data
  try {
    const formData = await req.formData();
    const mediaFile = formData.get('mediaFile') as File;
    const isVideo = formData.get('isVideo') === 'true';
    // Language parameter is no longer used but kept for frontend compatibility
    // const language = formData.get('language') as string || 'auto';
    
    if (!mediaFile) {
      return NextResponse.json(
        { error: "Media file is missing" },
        { status: 400 }
      );
    }

    // Run automatic cleanup of old transcriptions in background
    // This helps prevent accumulation of files without adding delay to the request
    try {
      // We use setTimeout to make this non-blocking
      setTimeout(async () => {
        try {
          const result = await cleanupOldTranscriptions(AUTO_CLEANUP_AGE_HOURS);
          console.log(`Auto cleanup completed: ${result.deleted} files removed, ${result.keptCount} kept`);
        } catch (cleanupError) {
          console.error("Error during automatic transcription cleanup:", cleanupError);
        }
      }, 100);
    } catch (e) {
      // Don't let cleanup failures affect the main process
      console.warn("Failed to schedule automatic cleanup:", e);
    }

    // Preserve the original filename
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
      
      // Audio file validation
      const validatedFilePath = validateAudioFile(audioFilePath);
      
      // Generate unique identifier for the recording
      const audioId = Date.now().toString();
      
      // Audio transcription
      console.log("Starting audio transcription...");
      const transcriptionResult = await transcribeAudio(validatedFilePath);
      console.log("Transcription completed successfully!");
      
      // Simplify transcription segments
      const simplifiedTranscription = { ...transcriptionResult };
      if (simplifiedTranscription.segments && Array.isArray(simplifiedTranscription.segments)) {
        simplifiedTranscription.segments = simplifiedTranscription.segments.map((segment: GroqTranscriptionSegment) => ({
          ...segment,
          start: Math.floor(segment.start),
          end: Math.floor(segment.end)
        }));
      }
      
      // Add metadata including original filename
      const transcriptionWithMetadata = {
        ...simplifiedTranscription,
        metadata: {
          originalFileName: originalFileName,
          processingDate: new Date().toISOString(),
          fileSize: mediaFile.size,
          isVideo: isVideo
        }
      };
      
      // Save transcription to disk for later use
      const transcriptionsDir = await getTranscriptionsDir();
      const transcriptionFilePath = path.join(transcriptionsDir, `${audioId}.json`);
      await writeFile(
        transcriptionFilePath, 
        JSON.stringify(transcriptionWithMetadata, null, 2)
      );
      console.log(`Saved transcription to file: ${transcriptionFilePath}`);
      
      // Create audio metadata as a substitute for videoDetails
      const mediaDetails = {
        title: originalFileName,
        originalFileName: originalFileName,
        lengthSeconds: Math.ceil(transcriptionResult.duration || 0).toString(),
        thumbnails: [],
        isVideo: isVideo
      };
      
      // Clean up temporary files
      cleanupTempFiles(filesToCleanup);
      
      console.log("Analysis completed successfully, returning results");
      return NextResponse.json(
        {
          audioId,
          audioDetails: mediaDetails,
          transcription: transcriptionWithMetadata
        }
      );
    } catch (error) {
      // Clean up temporary files in case of error
      cleanupTempFiles(filesToCleanup);
      throw error;
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
