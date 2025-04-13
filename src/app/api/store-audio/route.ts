import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Get the current authenticated user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the form data to get the audio file
    const formData = await req.formData();
    const audioFile = formData.get("audioFile") as File | null;
    const audioId = formData.get("audioId") as string | null;
    
    if (!audioFile || !audioId) {
      return NextResponse.json(
        { error: "Missing audio file or audio ID" },
        { status: 400 }
      );
    }
    
    // Get file metadata
    const fileSize = audioFile.size;
    
    // Ensure we get the original filename, not a generated one
    const originalFileName = audioFile.name;
    console.log(`Storing audio file with original name: ${originalFileName}`);
    
    // Read file into ArrayBuffer
    const bytes = await audioFile.arrayBuffer();
    
    console.log(`Storing audio with ID: ${audioId}`);
    console.log(`Original file name: ${originalFileName}`);
    console.log(`File size: ${fileSize} bytes`);
    console.log(`ArrayBuffer size: ${bytes.byteLength} bytes`);
    
    // Check file size limit (25MB)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 25MB limit. Current size: ${Math.round(fileSize / (1024 * 1024))}MB` },
        { status: 400 }
      );
    }
    
    // Estimate audio duration (this is a rough estimate, in a real app you'd get actual duration)
    // Assuming ~128kbps bitrate for estimate
    const estimatedDuration = (fileSize / (128 * 1024 / 8)); // duration in seconds
    
    try {
      // Store in Convex through the mutation
      console.log("Calling Convex mutation api.audio.storeAudioBlob");
      const result = await convex.mutation(api.audio.storeAudioBlob, {
        audioId,
        audioBlob: bytes,
        fileName: originalFileName,
        duration: estimatedDuration / 1000, // convert to seconds
        fileSize
      });
      
      console.log("Convex mutation result:", result);
      
      return NextResponse.json({ 
        success: true,
        message: "Audio stored successfully",
        audioId,
        fileName: originalFileName
      });
    } catch (error) {
      console.error("Error calling Convex mutation:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error storing audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to store audio: ${errorMessage}` },
      { status: 500 }
    );
  }
} 