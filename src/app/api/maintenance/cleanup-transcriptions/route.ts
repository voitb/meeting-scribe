import { NextRequest, NextResponse } from "next/server";
import { cleanupOldTranscriptions, getTranscriptionStats } from "@/lib/transcription-manager";

// API endpoint to clean up old transcription files
// Can be run manually or via scheduled task/cron job
export async function GET(req: NextRequest) {
  try {
    // Extract parameters from URL if provided
    const searchParams = req.nextUrl.searchParams;
    const maxAgeHours = searchParams.get('maxAgeHours') 
      ? parseInt(searchParams.get('maxAgeHours') as string, 10) 
      : 24; // Default 24 hours
    
    // Get statistics before cleanup
    const statsBefore = await getTranscriptionStats();
    
    // Run the cleanup process
    const result = await cleanupOldTranscriptions(maxAgeHours);
    
    // Get statistics after cleanup
    const statsAfter = await getTranscriptionStats();
    
    // Return cleanup results
    return NextResponse.json({
      success: true,
      message: `Transcription cleanup completed successfully. Deleted ${result.deleted} files, freed ${formatBytes(result.deletedSize)}.`,
      result,
      statsBefore,
      statsAfter
    });
  } catch (error) {
    console.error("Error during transcription cleanup:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during cleanup" 
      },
      { status: 500 }
    );
  }
}

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

 