import { NextRequest, NextResponse } from "next/server";
import { initializeProgress } from "@/lib/progress-store";
import { currentUser } from "@clerk/nextjs/server";
import { VideoAnalysisResult } from "@/types/analysis.types";
import { analyzeTranscription } from "@/lib/services/analysis-service";

// Extend VideoAnalysisResult type with fields needed for database storage
interface EnhancedAnalysisResult extends VideoAnalysisResult {
  userId?: string;
  analysisDate: string;
  sourceUrl?: string;
  originalFileName?: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("Starting POST request processing in /api/summarize");
    const data = await req.json();
    
    // Handle both videoDetails and audioDetails
    const title = data.videoDetails?.title || data.audioDetails?.title || "Untitled Recording";
    const { transcription, outputLanguage = "english" } = data;
    
    // Get or generate audioId
    const audioId = data.audioId || data.videoDetails?.id || data.audioDetails?.id;
    
    // Preserve original filename if available
    const originalFileName = data.audioDetails?.originalFileName || data.videoDetails?.originalFileName;
    if (originalFileName) {
      console.log(`Original filename preserved: ${originalFileName}`);
    }
    
    // Get userId from Clerk
    const user = await currentUser();
    const userId = user?.id;
    console.log(`User ID from Clerk: ${userId || 'not logged in'}`);
    
    if (!audioId) {
      console.error("Missing audio identifier for progress tracking");
    }
     
    if (!transcription.text) {
      throw new Error("No transcription text to analyze");
    }
    
    console.log("Starting transcription analysis...");
    
    // Initialize analysis progress if we have audioId
    if (audioId) {
      console.log(`Initializing progress tracking for audioId: ${audioId}`);
      initializeProgress(audioId);
    }
    
    // Pass audioId to analysis function for progress tracking
    const analysisResult = await analyzeTranscription(
      title,
      transcription,
      outputLanguage,
      audioId
    );

    // Add userId and analysis date to result
    const result: EnhancedAnalysisResult = {
      ...analysisResult,
      analysisDate: new Date().toISOString(),
      userId,
      sourceUrl: audioId,
      originalFileName: originalFileName || title
    };
    
    console.log("Final result prepared, returning response");
    
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Transcription analysis error:", errorMessage);
    return NextResponse.json(
      { error: `Transcription analysis error: ${errorMessage}` },
      { status: 500 }
    );
  }
}