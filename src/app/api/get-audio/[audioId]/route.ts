import { NextRequest, NextResponse } from "next/server";
import { fetchAudioFromConvex, prepareAudioResponse } from "@/utils/audio-service";
import { createErrorResponse } from "@/lib/api-utils";
import { api } from "../../../../../convex/_generated/api";
import { ConvexAudioData } from "@/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ audioId: string }> }
) {
  try {
    const { audioId } = await params;
    if (!audioId) {
      return createErrorResponse("Audio ID is required", 400);
    }
    
    try {
      const audioData = await fetchAudioFromConvex<ConvexAudioData>(
        audioId,
        api.audio.getAudioBlobPublic,
        api.audio.getAudioBlob,
        api.debug.getAllAnalysesForAudioId
      );
      
      const { buffer, contentType, fileName } = prepareAudioResponse(audioData);
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${fileName}"`,
          'Content-Length': String(buffer.length),
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (audioError) {
      console.error("Error retrieving audio data:", audioError);
      return createErrorResponse("Audio not found or no audio data stored", 404);
    }
  } catch (error) {
    console.error("Error retrieving audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(`Failed to retrieve audio: ${errorMessage}`, 500);
  }
} 