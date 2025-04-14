import { deleteTranscription } from "@/lib/transcription-manager";
import { createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { NextResponse } from "next/server";
import { TranscriptionDeleteResponse } from "@/types/api";

export async function handleTranscriptionDeletion(audioId: string): Promise<NextResponse> {
  if (!audioId) {
    return createErrorResponse("Audio ID is required", 400);
  }

  console.log(`Attempting to delete transcription file for audio ID: ${audioId}`);
  
  const deleted = await deleteTranscription(audioId);
  
  if (deleted) {
    return createApiResponse<TranscriptionDeleteResponse>({ 
      success: true, 
      message: `Transcription file for ${audioId} was deleted successfully.` 
    });
  } else {
    return createApiResponse<TranscriptionDeleteResponse>(
      { 
        success: false, 
        message: `Transcription file for ${audioId} was not found or could not be deleted.` 
      },
      { status: 404 }
    );
  }
} 