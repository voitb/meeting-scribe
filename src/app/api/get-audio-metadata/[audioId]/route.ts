import { NextRequest } from "next/server";
import { fetchAudioMetadata, createDefaultMetadata } from "@/utils/audio-metadata";
import { createApiResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ audioId: string }> }
) {
  try {
    const { audioId } = await params;

    if (!audioId) {
      return createErrorResponse("Audio ID is required", 400);
    }

    console.log(`Fetching metadata for audio ID: ${audioId}`);
    
    const metadata = await fetchAudioMetadata(audioId);
    return createApiResponse(metadata);
    
  } catch (error) {
    console.error("Error retrieving audio metadata:", error);
    
    const id = "unknown";
    const defaultMetadata = createDefaultMetadata(id);
    
    return createApiResponse({
      ...defaultMetadata,
      error: "Error processing metadata request"
    });
  }
} 