import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getTranscriptionsDir } from "@/lib/transcription-manager";

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

    // Get transcriptions directory
    const transcriptionsDir = await getTranscriptionsDir();

    // Path to transcription file which contains metadata
    const transcriptionFilePath = path.join(transcriptionsDir, `${audioId}.json`);
    
    // Przygotuj domyślne metadane na wypadek braku pliku
    const defaultMetadata = {
      audioId,
      originalFileName: `recording-${audioId}.mp3`,
      metadata: {
        duration: 0,
        language: 'en',
        processingDate: new Date().toISOString(),
        fileSize: 0
      }
    };
    
    try {
      // Sprawdź, czy plik istnieje bez rzucania wyjątku przy jego braku
      let fileExists = false;
      try {
        await fs.access(transcriptionFilePath);
        fileExists = true;
      } catch {
        console.log(`Transcription file not found: ${transcriptionFilePath}, returning default metadata`);
        return NextResponse.json(defaultMetadata);
      }
      
      if (fileExists) {
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
      }
    } catch (err) {
      // Obsługa innych błędów poza brakiem pliku
      console.error(`Error processing metadata for: ${audioId}`, err);
      // Zwróć domyślne metadane zamiast błędu
      return NextResponse.json(defaultMetadata);
    }
    
    // Jeśli coś poszło nie tak, ale nie złapaliśmy konkretnego błędu
    return NextResponse.json(defaultMetadata);
    
  } catch (error) {
    // W tym bloku catch używamy domyślnej wartości id, ponieważ nie możemy odzyskać audioId
    const id = "unknown";
    
    console.error("Error retrieving audio metadata:", error);
    return NextResponse.json(
      { 
        audioId: id,
        originalFileName: `recording-${id}.mp3`,
        metadata: {
          duration: 0,
          language: 'en',
          processingDate: new Date().toISOString(),
          fileSize: 0
        },
        error: "Error processing metadata request"
      }
    );
  }
} 