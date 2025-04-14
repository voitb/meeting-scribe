import { NextRequest } from "next/server";
import { processMediaFile, scheduleAutoCleanup, MediaFile } from "@/utils/analyze-utils";
import { ensureTranscriptionsDir } from "@/lib/transcription-manager";
import { createApiResponse, createErrorResponse } from "@/lib/api-utils";

// Initialize transcriptions directory
(async () => {
  try {
    await ensureTranscriptionsDir();
  } catch (error) {
    console.error("Error ensuring transcriptions directory:", error);
  }
})();

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mediaFile = formData.get('mediaFile') as File;
    const isVideo = formData.get('isVideo') === 'true';
    
    if (!mediaFile) {
      return createErrorResponse("Media file is missing", 400);
    }

    // Run automatic cleanup of old transcriptions in background
    try {
      await scheduleAutoCleanup();
    } catch (e) {
      console.warn("Failed to schedule automatic cleanup:", e);
    }

    // Process the uploaded file
    const result = await processMediaFile(mediaFile as unknown as MediaFile, isVideo);
    
    return createApiResponse(result);
  } catch (error) {
    console.error("Error processing request:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error", 
      500
    );
  }
}
