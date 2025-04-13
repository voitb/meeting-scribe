import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Directory for storing transcriptions
const TRANSCRIPTIONS_DIR = path.join(process.cwd(), "transcriptions");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ audioId: string }> }
) {
  try {
    const { audioId } = await params;

    if (!audioId) {
      return NextResponse.json(
        { error: "Audio ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching metadata for audio ID: ${audioId}`);

    // Path to transcription file which contains metadata
    const transcriptionFilePath = path.join(TRANSCRIPTIONS_DIR, `${audioId}.json`);
    
    // Check if transcription file exists
    try {
      await fs.access(transcriptionFilePath);
      
      // Read file to get metadata
      const transcriptionData = await fs.readFile(transcriptionFilePath, 'utf-8');
      const transcription = JSON.parse(transcriptionData);
      
      // Extract original filename from metadata if available
      let originalFileName = null;
      
      if (transcription.metadata && transcription.metadata.originalFileName) {
        originalFileName = transcription.metadata.originalFileName;
      } else if (transcription.audioDetails && transcription.audioDetails.originalFileName) {
        originalFileName = transcription.audioDetails.originalFileName;
      }
      
      console.log(`Retrieved original filename for ${audioId}: ${originalFileName || 'not found'}`);
      
      return NextResponse.json({
        audioId,
        originalFileName: originalFileName || `recording-${audioId}.mp3`,
        metadata: {
          duration: transcription.duration || 0,
          language: transcription.language || 'en',
          processingDate: transcription.metadata?.processingDate || new Date().toISOString(),
          fileSize: transcription.metadata?.fileSize || 0
        }
      });
      
    } catch (err) {
      console.error(`Metadata file not found for: ${audioId}`, err);
      return NextResponse.json(
        { error: "Metadata not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error retrieving audio metadata:", error);
    return NextResponse.json(
      { error: "Failed to retrieve audio metadata" },
      { status: 500 }
    );
  }
} 