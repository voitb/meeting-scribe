import { NextRequest } from "next/server";
import { fetchTranscription, createErrorTranscription } from "@/utils/transcription-service";
import { createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { TranscriptionResponse } from "@/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ audioId: string }> }
) {
  try {
    const { audioId } = await params;

    if (!audioId) {
      return createErrorResponse("Audio ID is required", 400);
    }
    
    const response = await fetchTranscription(audioId);
    return createApiResponse(response);
    
  } catch (error) {
    console.error("Error while fetching transcription:", error);
    
    const errorResponse: TranscriptionResponse = { 
      transcription: createErrorTranscription(),
      error: "Error processing transcription request"
    };
    
    return createApiResponse(errorResponse);
  }
} 