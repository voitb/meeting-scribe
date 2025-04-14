import { NextRequest } from "next/server";
import { handleTranscriptionDeletion } from "@/utils/transcription-utils";
import { createErrorResponse } from "@/lib/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ audioId: string }> }
) {
  try {
    const { audioId } = await params;
    return await handleTranscriptionDeletion(audioId);
  } catch (error) {
    console.error("Error deleting transcription file:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Unknown error deleting transcription",
      500
    );
  }
} 