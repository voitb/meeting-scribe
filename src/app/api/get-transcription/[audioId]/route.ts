import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getTranscriptionsDir } from "@/lib/transcription-manager";

// Import database access function (optional)
// import { db } from "@/lib/db";

// In a real implementation, here we could fetch the transcription from a database
// or from the file system where it was previously saved during audio file upload

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

    console.log(`Fetching transcription for audio ID: ${audioId}`);

    // Get transcriptions directory
    const transcriptionsDir = await getTranscriptionsDir();

    // Path to transcription file
    const transcriptionFilePath = path.join(transcriptionsDir, `${audioId}.json`);
    
    // Domyślna transkrypcja, gdy plik nie istnieje
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
    
    // Sprawdzamy czy plik istnieje
    let fileExists = false;
    try {
      await fs.access(transcriptionFilePath);
      fileExists = true;
    } catch {
      console.log(`Transcription file does not exist: ${transcriptionFilePath}, returning sample transcription`);
      return NextResponse.json({ transcription: demoTranscription });
    }

    if (fileExists) {
      // Read transcription file contents
      try {
        const transcriptionContent = await fs.readFile(transcriptionFilePath, 'utf-8');
        const transcription = JSON.parse(transcriptionContent);

        if (!transcription) {
          console.log(`Transcription content is empty for: ${audioId}`);
          return NextResponse.json({ transcription: demoTranscription });
        }

        console.log("Successfully retrieved transcription");
        return NextResponse.json({ transcription });
      } catch (readError) {
        console.error(`Error reading or parsing transcription file: ${transcriptionFilePath}`, readError);
        return NextResponse.json({ transcription: demoTranscription });
      }
    }

    // Jeśli dotarliśmy tutaj, to zwracamy domyślną transkrypcję
    return NextResponse.json({ transcription: demoTranscription });
  } catch (error) {
    console.error("Error while fetching transcription:", error);
    
    // Zwracamy przykładową transkrypcję zamiast błędu
    return NextResponse.json({ 
      transcription: {
        task: "transcribe",
        language: "en",
        duration: 125.88,
        text: `This is a sample transcription. The actual transcription could not be retrieved due to an error.`,
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
      },
      error: "Error processing transcription request"
    });
  }
}