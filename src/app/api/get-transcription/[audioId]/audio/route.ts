import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promisify } from "util";

// Promisify the fs.readFile method
const readFile = promisify(fs.readFile);

export async function GET(
  request: NextRequest,
  { params }: { params: { audioId: string } }
) {
  try {
    const { audioId } = params;
    if (!audioId) {
      return NextResponse.json(
        { error: "Audio ID is required" },
        { status: 400 }
      );
    }

    console.log(`Providing fallback audio for ID: ${audioId}`);

    // Path to our demo audio - using sample file from /public (if exists)
    // or generating a silent audio file as fallback
    let audioBuffer;
    try {
      const demoAudioPath = path.join(process.cwd(), "public", "sample-audio.mp3");
      audioBuffer = await readFile(demoAudioPath);
    } catch (err) {
      // If the sample audio file doesn't exist, create a simple silent MP3
      console.log("Sample audio file not found, using generated fallback:", 
        err instanceof Error ? err.message : String(err));
      // This is a very basic MP3 file header for 1 second of silence
      audioBuffer = Buffer.from([
        0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        // Adding more bytes to ensure it's playable
        0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
    }

    // Return the audio file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `inline; filename="sample-${audioId}.mp3"`,
        'Content-Length': String(audioBuffer.length),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error providing fallback audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to provide audio: ${errorMessage}` },
      { status: 500 }
    );
  }
} 