import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Directory for storing transcriptions
const TRANSCRIPTIONS_DIR = path.join(process.cwd(), "transcriptions");

// Import database access function (optional)
// import { db } from "@/lib/db";

// In a real implementation, here we could fetch the transcription from a database
// or from the file system where it was previously saved during audio file upload

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ audioId: string }> }
) {
  try {
    const { audioId } =await params;

    if (!audioId) {
      return NextResponse.json(
        { error: "Audio ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching transcription for audio ID: ${audioId}`);

    // Path to transcription file
    const transcriptionFilePath = path.join(TRANSCRIPTIONS_DIR, `${audioId}.json`);
    
    // Check if transcription file exists
    try {
      await fs.access(transcriptionFilePath);
      // File exists, continue
    } catch {
      console.error(`Transcription file does not exist: ${transcriptionFilePath}`);
      
      // If it doesn't exist, return a demo transcription object (for demonstration purposes only)
      // In a real application, we should return a 404 error
      const demoTranscription = {
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
      
      return NextResponse.json({ transcription: demoTranscription });
    }

    // Read transcription file contents
    const transcriptionContent = await fs.readFile(transcriptionFilePath, 'utf-8');
    const transcription = JSON.parse(transcriptionContent);

    // In the future, we can implement a caching mechanism and store transcriptions
    // in a database for faster access

    if (!transcription) {
      return NextResponse.json(
        { error: "No transcription found for the given audio ID" },
        { status: 404 }
      );
    }

    console.log("Successfully retrieved transcription");
    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Error while fetching transcription:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the transcription" },
      { status: 500 }
    );
  }
}