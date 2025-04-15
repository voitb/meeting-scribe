import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { processAnalysisRequest } from "@/utils/analysis-service";
import { createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { SummarizeRequestData } from "@/types/api";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as SummarizeRequestData;
     
    const user = await currentUser();
    const userId = user?.id;
    
    const result = await processAnalysisRequest(data, userId);
    
    return createApiResponse(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Transcription analysis error:", errorMessage);
    return createErrorResponse(`Transcription analysis error: ${errorMessage}`, 500);
  }
}