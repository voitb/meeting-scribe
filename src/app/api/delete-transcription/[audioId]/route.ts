import { NextRequest, NextResponse } from "next/server";
import { deleteTranscription } from "@/lib/transcription-manager";

export async function DELETE(
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

    console.log(`Attempting to delete transcription file for audio ID: ${audioId}`);
    
    const deleted = await deleteTranscription(audioId);
    
    if (deleted) {
      return NextResponse.json({ 
        success: true, 
        message: `Transcription file for ${audioId} was deleted successfully.` 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: `Transcription file for ${audioId} was not found or could not be deleted.` 
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting transcription file:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error deleting transcription"
      },
      { status: 500 }
    );
  }
} 