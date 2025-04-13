import { NextRequest, NextResponse } from "next/server";
import { getProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
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

    const progress = getProgress(audioId);
    
    if (!progress) {
      return NextResponse.json(
        { error: "No analysis progress information found for the given ID" },
        { status: 404 }
      );
    }

    // Calculate overall progress in percentage
    let overallProgress = 0;
    
    if (progress.status === 'pending') {
      overallProgress = 0;
    } else if (progress.status === 'processing') {
      // If there are multiple chunks, calculate progress based on current chunk and its progress
      if (progress.totalChunks > 1) {
        const chunksCompleted = progress.currentChunk - 1;
        const chunksCompletedPercent = (chunksCompleted / progress.totalChunks) * 100;
        const currentChunkPercent = (progress.chunkProgress / 100) * (100 / progress.totalChunks);
        overallProgress = chunksCompletedPercent + currentChunkPercent;
      } else {
        overallProgress = progress.chunkProgress;
      }
    } else if (progress.status === 'completed') {
      overallProgress = 100;
    }

    // Adding logs for better debugging
    console.log(`Progress for audioId ${audioId}:`, { 
      status: progress.status,
      currentStep: progress.currentStep,
      currentChunk: progress.currentChunk,
      totalChunks: progress.totalChunks,
      chunkProgress: progress.chunkProgress,
      overallProgress: Math.round(overallProgress)
    });

    return NextResponse.json({
      ...progress,
      overallProgress: Math.round(overallProgress),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Error fetching analysis progress:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching analysis progress" },
      { status: 500 }
    );
  }
}