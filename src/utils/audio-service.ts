import { ConvexHttpClient } from "convex/browser";
import { AudioResponse, ConvexAudioData } from "@/types/api";
import { FunctionReference } from "convex/server";

let convexClient: ConvexHttpClient | null = null;

function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return convexClient;
}

export async function fetchAudioFromConvex<T extends ConvexAudioData>(
  audioId: string, 
  publicEndpoint: FunctionReference<"query", "public">, 
  authenticatedEndpoint: FunctionReference<"query", "public">,
  debugEndpoint?: FunctionReference<"query", "public">
): Promise<T> {
  const convex = getConvexClient();
  
  // Try public endpoint first
  try {
    console.log("Attempting to fetch audio using public endpoint");
    const audioData = await convex.query(publicEndpoint, { audioId });
    
    logAudioDataInfo("Public query response", audioData);
    
    if (audioData?.audioBlob) {
      console.log("Successfully fetched audio from public endpoint");
      console.log(`Audio blob size: ${audioData.audioBlob.byteLength} bytes`);
      console.log(`Filename: ${audioData.fileName || 'unknown'}`);
      return audioData as T;
    } else {
      console.log("No audio data found in public endpoint response");
    }
  } catch (error) {
    console.warn("Failed to fetch audio from public endpoint:", error);
    console.error("Public endpoint error details:", error instanceof Error ? error.message : String(error));
  }
  
  // Fall back to authenticated endpoint
  try {
    console.log("Attempting to fetch audio using authenticated endpoint");
    const audioData = await convex.query(authenticatedEndpoint, { audioId });
    
    logAudioDataInfo("Authenticated query response", audioData);
    
    if (audioData?.audioBlob) {
      console.log("Successfully fetched audio from authenticated endpoint");
      console.log(`Audio blob size: ${audioData.audioBlob.byteLength} bytes`);
      return audioData as T;
    } else {
      console.log("No audio data found in authenticated endpoint response");
    }
  } catch (authError) {
    console.error("Failed to fetch audio from authenticated endpoint:", authError);
    console.error(
      "Auth endpoint error details:", 
      authError instanceof Error ? authError.message : String(authError)
    );
  }
  
  // Debug: try to get all analyses for this ID if debug endpoint is provided
  if (debugEndpoint) {
    try {
      console.log("Checking database records for audioId:", audioId);
      const allAnalyses = await convex.query(debugEndpoint, { audioId });
      console.log(`Found ${allAnalyses?.length || 0} analyses for this audioId`);
      
      if (allAnalyses && allAnalyses.length > 0) {
        console.log("Analysis details:", JSON.stringify(allAnalyses, null, 2));
      } else {
        console.log("No analyses found for this audioId");
      }
    } catch (debugError) {
      console.error(
        "Debug query failed:", 
        debugError instanceof Error ? debugError.message : String(debugError)
      );
    }
  }
  
  throw new Error("Audio not found or no audio data stored");
}

export function prepareAudioResponse(audioData: ConvexAudioData): AudioResponse {
  console.log("Preparing audio response");
  console.log(`AudioBlob type: ${typeof audioData.audioBlob}`);
  console.log(`AudioBlob instance of ArrayBuffer: ${audioData.audioBlob instanceof ArrayBuffer}`);

  // Convert the ArrayBuffer to a Buffer
  const buffer = Buffer.from(audioData.audioBlob);
  console.log(`Converted buffer size: ${buffer.length} bytes`);

  // Determine content type based on file extension
  const fileName = audioData.fileName || `audio.mp3`;
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'mp3';
  
  let contentType = 'audio/mpeg'; // Default to MP3
  
  switch (fileExtension) {
    case 'wav':
      contentType = 'audio/wav';
      break;
    case 'ogg':
      contentType = 'audio/ogg';
      break;
    case 'm4a':
      contentType = 'audio/m4a';
      break;
    case 'webm':
      contentType = 'audio/webm';
      break;
  }

  return {
    buffer,
    contentType,
    fileName
  };
}

function logAudioDataInfo(prefix: string, data: unknown): void {
  console.log(prefix, JSON.stringify(data, (key, value) => {
    if (key === 'audioBlob' && value) {
      return `[ArrayBuffer of ${value.byteLength} bytes]`;
    }
    return value;
  }));
} 