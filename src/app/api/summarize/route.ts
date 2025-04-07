import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("Brak GROQ_API_KEY w zmiennych środowiskowych");
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, title } = await req.json();

    if (!transcript || transcript.trim() === "") {
      return NextResponse.json(
        { error: "Brak transkrypcji do analizy" },
        { status: 400 }
      );
    }

    // Wykorzystanie Groq API przez fetch
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "Jesteś pomocnym asystentem, który analizuje transkrypcje filmów i generuje dokładne podsumowania, wyróżnia najważniejsze punkty oraz tworzy pytania do dyskusji."
          },
          {
            role: "user",
            content: `Przeanalizuj poniższą transkrypcję z filmu YouTube${title ? ` zatytułowanego "${title}"` : ''} i stwórz:
            1. Krótkie streszczenie (1-2 akapity)
            2. Najważniejsze punkty (w formie listy punktowej)
            3. Potencjalne pytania do dyskusji (co najmniej 3)
            
            Zwróć wyniki w formacie JSON z polami: "summary", "keyPoints" (tablica stringów), "discussionQuestions" (tablica stringów).
            
            Transkrypcja:
            ${transcript}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Błąd API Groq: ${error}`);
    }

    // Pobieramy wyniki analizy
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Otrzymano pustą odpowiedź od Groq API");
    }
    
    try {
      // Próba parsowania JSON z odpowiedzi
      const parsedContent = JSON.parse(content);
      
      // Zwracamy sparsowane dane
      return NextResponse.json({
        title,
        ...parsedContent
      });
    } catch (parseError) {
      console.error("Błąd parsowania JSON z odpowiedzi Groq:", parseError);
      
      // Jeśli nie można sparsować JSON, zwróć surowy tekst
      return NextResponse.json({
        title,
        rawContent: content,
        error: "Nie udało się sparsować odpowiedzi jako JSON"
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Błąd podczas analizy transkrypcji:", errorMessage);
    return NextResponse.json(
      { error: `Błąd podczas analizy transkrypcji: ${errorMessage}` },
      { status: 500 }
    );
  }
} 