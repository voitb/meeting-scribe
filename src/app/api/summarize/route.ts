import { NextRequest, NextResponse } from "next/server";
import { analyzeTranscription } from "@/lib/analysis-utils";
import { MediaAnalysisResult } from "@/lib/media-analyzer";

export async function POST(req: NextRequest) {
  try {
    console.log("Starting POST request processing in /api/summarize");
    const { title, transcription, outputLanguage = "polish" } = await req.json();
    
    console.log("Received data:", { 
      title, 
      transcriptionLength: transcription?.text?.length || 0,
      outputLanguage
    });
     
    if (!transcription.text) {
      throw new Error("No transcription text to analyze");
    }
    
    console.log("Starting transcription analysis...");
    const analysisStart = Date.now();

    console.log("Transcription text:", transcription.text);
    
    const analysisResult = await analyzeTranscription(
      title,
      transcription,
      outputLanguage
    );

    const analysisTime = Date.now() - analysisStart;
    console.log(`Analysis completed in ${analysisTime}ms`);

    const result: Partial<MediaAnalysisResult> = {
      ...analysisResult,
      analysisDate: new Date().toISOString(),
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