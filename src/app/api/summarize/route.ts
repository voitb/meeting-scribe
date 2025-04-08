import { NextRequest, NextResponse } from "next/server";
import { groq } from '@ai-sdk/groq';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY in environment variables");
}


export async function POST(req: NextRequest) {
  try {
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error analyzing transcript:", errorMessage);
    return NextResponse.json(
      { error: `Error analyzing transcript: ${errorMessage}` },
      { status: 500 }
    );
  }
}