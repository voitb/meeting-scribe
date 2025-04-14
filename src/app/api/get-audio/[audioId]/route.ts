import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { audioId: string } }
) {
  try {
    const { audioId } = await params;
    if (!audioId) {
      return NextResponse.json(
        { error: "Audio ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching audio with ID: ${audioId}`);
    
    // Fetch audio blob from Convex - using a special query that doesn't require auth
    // This is to support public playback while still preserving authentication for saving
    let audioData;
    try {
      console.log("Attempting to fetch audio using public endpoint");
      audioData = await convex.query(api.audio.getAudioBlobPublic, { audioId });
      console.log("Public query response:", JSON.stringify(audioData, (key, value) => {
        if (key === 'audioBlob' && value) {
          return `[ArrayBuffer of ${value.byteLength} bytes]`;
        }
        return value;
      }));
      
      if (audioData?.audioBlob) {
        console.log("Successfully fetched audio from public endpoint");
        console.log(`Audio blob size: ${audioData.audioBlob.byteLength} bytes`);
        console.log(`Filename: ${audioData.fileName || 'unknown'}`);
      } else {
        console.log("No audio data found in public endpoint response");
        console.log("Public endpoint returned:", audioData);
      }
    } catch (error) {
      console.warn("Failed to fetch audio from public endpoint:", error);
      console.error("Public endpoint error details:", error instanceof Error ? error.message : String(error));
      
      // Fall back to authenticated query if necessary
      console.log("Attempting to fetch audio using authenticated endpoint");
      try {
        audioData = await convex.query(api.audio.getAudioBlob, { audioId });
        console.log("Authenticated query response:", JSON.stringify(audioData, (key, value) => {
          if (key === 'audioBlob' && value) {
            return `[ArrayBuffer of ${value.byteLength} bytes]`;
          }
          return value;
        }));
        
        if (audioData?.audioBlob) {
          console.log("Successfully fetched audio from authenticated endpoint");
          console.log(`Audio blob size: ${audioData.audioBlob.byteLength} bytes`);
        } else {
          console.log("No audio data found in authenticated endpoint response");
          console.log("Authenticated endpoint returned:", audioData);
        }
      } catch (authError) {
        console.error("Failed to fetch audio from authenticated endpoint:", authError);
        console.error("Auth endpoint error details:", authError instanceof Error ? authError.message : String(authError));
      }
    }

    if (!audioData || !audioData.audioBlob) {
      console.log("No audio data found for ID:", audioId);
      
      // Debug: try to get all analyses for this ID
      try {
        console.log("Checking database records for audioId:", audioId);
        const allAnalyses = await convex.query(api.debug.getAllAnalysesForAudioId, { audioId });
        console.log(`Found ${allAnalyses?.length || 0} analyses for this audioId`);
        
        if (allAnalyses && allAnalyses.length > 0) {
          console.log("Analysis details:", JSON.stringify(allAnalyses, null, 2));
        } else {
          console.log("No analyses found for this audioId");
          
          // Also check if there are any analyses at all in the database
          const allRecords = await convex.query(api.debug.getAllAnalyses, {});
          console.log(`Total analyses in database: ${allRecords?.length || 0}`);
          if (allRecords && allRecords.length > 0) {
            console.log("All analyses:", JSON.stringify(allRecords, null, 2));
          }
        }
      } catch (debugError) {
        console.error("Debug query failed:", debugError instanceof Error ? debugError.message : String(debugError));
      }
      
      return NextResponse.json(
        { error: "Audio not found or no audio data stored" },
        { status: 404 }
      );
    }
    
    console.log("Preparing audio response");
    console.log(`AudioBlob type: ${typeof audioData.audioBlob}`);
    console.log(`AudioBlob instance of ArrayBuffer: ${audioData.audioBlob instanceof ArrayBuffer}`);

    // Convert the ArrayBuffer to a Buffer
    const buffer = Buffer.from(audioData.audioBlob);
    console.log(`Converted buffer size: ${buffer.length} bytes`);

    // Determine content type based on file extension
    const fileName = audioData.fileName || `audio-${audioId}.mp3`;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'mp3';
    
    let contentType = 'audio/mpeg'; // Default to MP3
    
    switch (fileExtension) {
      case 'wav':
        contentType = 'audio/wav';
        break;
      case 'ogg':
        contentType = 'audio/ogg';
        break;
      case 'm4a':
        contentType = 'audio/m4a';
        break;
      case 'webm':
        contentType = 'audio/webm';
        break;
    }

    // Return the audio file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error retrieving audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to retrieve audio: ${errorMessage}` },
      { status: 500 }
    );
  }
} 