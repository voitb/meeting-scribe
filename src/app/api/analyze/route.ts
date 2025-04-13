import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { transcribeAudio, GroqTranscriptionSegment } from "@/lib/audio-utils";
import { writeFile } from "fs/promises";
import { cleanupTempFiles, generateTempFilePath, validateAudioFile } from "@/lib/file-utils";
import path from "path";
import fs from "fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Directory for storing transcriptions
const TRANSCRIPTIONS_DIR = path.join(process.cwd(), "transcriptions");

// Ensure transcriptions directory exists
if (!fs.existsSync(TRANSCRIPTIONS_DIR)) {
  fs.mkdirSync(TRANSCRIPTIONS_DIR, { recursive: true });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  // Check if it's multipart/form-data
  try {
    // Get user for Convex storage (optional - will only store if logged in)
    const user = await currentUser();
    const userId = user?.id;

    const formData = await req.formData();
    const audioFile = formData.get('audioFile') as File;
    // Language parameter is no longer used but kept for frontend compatibility
    // const language = formData.get('language') as string || 'auto';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is missing" },
        { status: 400 }
      );
    }

    // Preserve the original filename
    const originalFileName = audioFile.name;
    console.log(`Processing audio file: ${originalFileName}`);

    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save file temporarily
    const tempBasePath = generateTempFilePath("audio-upload");
    const fileExtension = originalFileName.split('.').pop() || 'mp3';
    const tempFilePath = `${tempBasePath}.${fileExtension}`;
    
    try {
      await writeFile(tempFilePath, buffer);
      console.log("Audio file saved successfully:", tempFilePath);
      
      // Audio file validation
      const validatedFilePath = validateAudioFile(tempFilePath);
      
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
          fileSize: audioFile.size
        }
      };
      
      // Save transcription to disk for later use
      const transcriptionFilePath = path.join(TRANSCRIPTIONS_DIR, `${audioId}.json`);
      await writeFile(
        transcriptionFilePath, 
        JSON.stringify(transcriptionWithMetadata, null, 2)
      );
      console.log(`Saved transcription to file: ${transcriptionFilePath}`);
      
      // Create audio metadata as a substitute for videoDetails
      const audioDetails = {
        title: originalFileName,
        originalFileName: originalFileName,
        lengthSeconds: Math.ceil(transcriptionResult.duration || 0).toString(),
        thumbnails: []
      };
      
      // Store the audio file in Convex if the user is authenticated
      if (userId) {
        try {
          console.log("Attempting to store audio blob in Convex database");
          console.log(`User ID: ${userId}`);
          console.log(`Audio ID: ${audioId}`);
          console.log(`Original file name: ${originalFileName}`);
          console.log(`Audio file size: ${audioFile.size} bytes`);
          console.log(`ArrayBuffer size: ${bytes.byteLength} bytes`);
          
          // First, create an empty analysis entry to get an ID
          const analysisId = await convex.mutation(api.audio.addAudioAnalysis, {
            url: audioId,
            title: originalFileName,
            summary: "Processing...",
            keyPoints: ["Processing..."],
            audioChapters: [],
            presentationQuality: {
              overallClarity: "",
              difficultSegments: [],
              improvementSuggestions: []
            },
            glossary: {},
            analysisDate: new Date().toISOString()
          });
          
          console.log(`Analysis ID created: ${analysisId}`);
          
          if (analysisId) {
            // Then, store the blob using the audio ID
            const estimatedDuration = (audioFile.size / (128 * 1024 / 8)); // rough estimate based on ~128kbps bitrate
            
            console.log(`Calling storeAudioBlob with audioId: ${audioId}`);
            console.log(`Estimated duration: ${estimatedDuration / 1000} seconds`);
            
            // Convex expects a bytes value, which is compatible with ArrayBuffer
            // No need for additional conversion
            try {
              const result = await convex.mutation(api.audio.storeAudioBlob, {
                audioId,
                audioBlob: bytes, // Pass the ArrayBuffer directly
                fileName: originalFileName,
                duration: estimatedDuration / 1000, // convert ms to seconds
                fileSize: audioFile.size
              });
              
              console.log("Audio blob store result:", result);
              console.log("Audio blob stored successfully in Convex");
            } catch (blobError) {
              console.error("Error storing audio blob:", blobError);
              if (blobError instanceof Error) {
                console.error("Blob error details:", blobError.message);
                console.error("Blob error stack:", blobError.stack);
              }
            }
          } else {
            console.error("Failed to create analysis ID - cannot store audio blob");
          }
        } catch (err) {
          console.error("Failed to store audio in Convex:", err);
          if (err instanceof Error) {
            console.error("Error details:", err.message);
            console.error("Error stack:", err.stack);
          }
          // Continue with transcription even if Convex storage fails
        }
      } else {
        console.log("User not authenticated, skipping audio blob storage");
      }
      
      // Clean up temporary file
      cleanupTempFiles([tempFilePath]);
      
      console.log("Analysis completed successfully, returning results");
      return NextResponse.json(
        {
          audioId,
          audioDetails,
          transcription: transcriptionWithMetadata
        }
      );
    } catch (error) {
      // Clean up temporary file in case of error
      cleanupTempFiles([tempFilePath]);
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
