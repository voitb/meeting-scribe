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
  const responseHeaders = new Headers();

  const randomName = Math.random().toString(36).substring(2, 15);

  responseHeaders.set(
    "Content-Disposition",
    `attachment; filename="${randomName}.mp4"`,
  );

  responseHeaders.set('Content-Type', 'audio/mp4')

  responseHeaders.set(
  "User-Agent",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
);

  responseHeaders.set("Accept-Language", "en-US,en;q=0.9");
  responseHeaders.set("Referer", "https://www.youtube.com/");
  responseHeaders.set("sec-ch-ua", '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"');
  responseHeaders.set("sec-ch-ua-mobile", "?0");
  responseHeaders.set("sec-ch-ua-platform", '"Windows"');


  try {
    const { videoDetails, transcription } = await fetchAudioFromYouTube(url, language || "auto");

    console.log("Analysis completed successfully, returning results");
    return NextResponse.json(
      {
        videoDetails,
        transcription: transcription
      },
      {
        headers: responseHeaders
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
