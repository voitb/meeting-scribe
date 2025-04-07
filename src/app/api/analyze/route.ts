import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";

// Sprawdzenie czy mamy klucze API
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("Brak GROQ_API_KEY w zmiennych środowiskowych");
}

// Funkcja do pobierania audio z YouTube
async function downloadAudio(url: string): Promise<Buffer> {
  try {
    // Pobieramy tylko ścieżkę audio w najlepszej jakości (format opus)
    const audioStream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    // Zamiana strumienia na bufor
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    
    return Buffer.concat(chunks);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Błąd podczas pobierania audio:", errorMessage);
    throw new Error(`Błąd podczas pobierania audio: ${errorMessage}`);
  }
}

// Endpoint do transkrypcji audio
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: "Nieprawidłowy URL YouTube" },
        { status: 400 }
      );
    }

    // Pobierz informacje o filmie
    const videoInfo = await ytdl.getInfo(url);
    const videoDuration = parseInt(videoInfo.videoDetails.lengthSeconds);
    const videoTitle = videoInfo.videoDetails.title;

    // Dodajemy logowanie tytułu
    console.log(`Przetwarzanie filmu: "${videoTitle}"`);

    // Sprawdź czy film nie jest zbyt długi (np. ponad 2 godziny)
    if (videoDuration > 7200) {
      return NextResponse.json(
        { error: "Film jest zbyt długi (ponad 2 godziny)" },
        { status: 400 }
      );
    }

    // Pobierz audio
    const audioBuffer = await downloadAudio(url);

    try {
      // Używamy Groq API do transkrypcji audio przez Whisper
      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: (() => {
          const formData = new FormData();
          
          // Tworzymy Blob z bufora audio
          const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
          
          // Dodajemy plik do FormData
          formData.append("file", audioBlob, "audio.mp3");
          formData.append("model", "whisper-large-v3");
          formData.append("language", "pl");
          formData.append("response_format", "text");
          
          return formData;
        })(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Błąd API Groq (${response.status}): ${errorText}`);
      }

      // Pobieramy tekst transkrypcji
      const transcription = await response.text();
      
      // Zwracamy transkrypcję jako JSON
      return NextResponse.json({ 
        title: videoTitle,
        transcription 
      });
    } catch (error: unknown) {
      console.error("Błąd transkrypcji:", error);
      return NextResponse.json(
        { 
          error: "Błąd podczas przetwarzania audio przez Whisper",
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Błąd podczas przetwarzania:", errorMessage);
    return NextResponse.json(
      { error: `Błąd podczas przetwarzania: ${errorMessage}` },
      { status: 500 }
    );
  }
} 