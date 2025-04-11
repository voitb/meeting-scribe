import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchAudioFromYouTube } from "@/lib/youtube-audio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const { url, language } = await req.json();
  
  if (!url) {
    return NextResponse.json(
      { error: "Missing YouTube URL" },
      { status: 400 }
    );
  }

  try {
    const { videoDetails, transcription } = await fetchAudioFromYouTube(url, language || "auto");

    console.log("Analysis completed successfully, returning results");
    return NextResponse.json(
      {
        videoDetails,
        transcription: transcription
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
