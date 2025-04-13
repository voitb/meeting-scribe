import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { cleanAndParseAIResponse, splitTranscriptionIntoChunks, mergeAnalysisResults, formatTime } from '../analysis-utils';
import { VideoAnalysisResult } from '@/types/analysis.types';
import { Transcription } from '@/types/analysis.types';
import { markAsCompleted, markAsError, updateChunkProgress } from '../progress-store';

// --- Główna funkcja analizy ---

/**
 * Analizuje transkrypcję audio, dzieląc ją w razie potrzeby na części,
 * wysyłając do AI i łącząc wyniki.
 */
export async function analyzeTranscription(
  title: string,
  transcription: Transcription,
  outputLanguage: string = "english",
  audioId?: string // ID do śledzenia postępu
): Promise<VideoAnalysisResult> {
  const operationId = audioId || `analysis-${Date.now()}`; // Use provided ID or generate one
  console.log(`[${operationId}] Starting transcription analysis for "${title}"...`);

  try {
    if (!transcription || !transcription.segments || transcription.segments.length === 0) {
        console.warn(`[${operationId}] Transcription has no segments. Returning minimal result.`);
        markAsCompleted(operationId, "Analysis completed (no segments)");
        return createEmptyResult(title, "Transcription contains no segments.");
    }

    console.log(`[${operationId}] Total segments: ${transcription.segments.length}, Total text length: ${transcription.text?.length || 0} chars`);

    // Używamy funkcji z utils do podziału na części
    const MAX_SEGMENTS_PER_CHUNK = 50; // Można dostosować
    const MAX_TEXT_LENGTH_PER_CHUNK = 15000; // Limit znaków na część (bezpieczny margines)
    const chunks = splitTranscriptionIntoChunks(transcription, MAX_SEGMENTS_PER_CHUNK, MAX_TEXT_LENGTH_PER_CHUNK);
    const totalChunks = chunks.length;

    if (totalChunks === 0) {
        console.error(`[${operationId}] Splitting resulted in zero chunks. Cannot proceed.`);
        markAsError(operationId, "Error: Failed to split transcription into chunks.");
        return createEmptyResult(title, "Error during transcription splitting.");
    }

    console.log(`[${operationId}] Split into ${totalChunks} chunk(s) for analysis.`);

    const analysisPromises: Promise<VideoAnalysisResult>[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunk = chunks[i];
      const chunkNumber = i + 1;

      // Rozpoczynamy analizę asynchronicznie dla każdej części
      analysisPromises.push(
        analyzeTranscriptionChunk(
          title, // Przekazujemy oryginalny tytuł
          chunk,
          outputLanguage,
          operationId,
          chunkNumber,
          totalChunks
        )
      );
    }

    // Czekamy na zakończenie analizy wszystkich części
    const results = await Promise.all(analysisPromises);

    // Łączymy wyniki
    console.log(`[${operationId}] Merging results from ${results.length} chunk(s)...`);
    const mergedResult = mergeAnalysisResults(results, title); // Używamy funkcji z utils

    markAsCompleted(operationId, "Analysis completed successfully");
    console.log(`[${operationId}] Analysis finished successfully.`);
    return mergedResult;

  } catch (error) {
    console.error(`[${operationId}] Critical error during analyzeTranscription:`, error);
    markAsError(operationId, `Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    // Zwracamy pusty wynik z informacją o błędzie
    return createEmptyResult(title, `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// --- Funkcja analizująca pojedynczą część transkrypcji ---

/**
 * Analizuje pojedynczą część transkrypcji, wysyłając ją do AI.
 */
async function analyzeTranscriptionChunk(
  title: string, // Oryginalny tytuł jest potrzebny do kontekstu, ale nie musi być w wyniku AI
  transcriptionChunk: Transcription,
  outputLanguage: string,
  operationId: string, // Używamy ID operacji do logowania i postępu
  currentChunk: number,
  totalChunks: number
): Promise<VideoAnalysisResult> {
  const chunkLabel = `Chunk ${currentChunk}/${totalChunks}`;
  console.log(`[${operationId}] [${chunkLabel}] Starting analysis...`);

  try {
    updateChunkProgress(operationId, currentChunk, totalChunks, 10, `Preparing ${chunkLabel}`);

    // Tworzenie promptu za pomocą dedykowanej funkcji
    const prompt = createAnalysisPrompt(transcriptionChunk);
    console.log(`[${operationId}] [${chunkLabel}] Prompt created (length: ${prompt.length}).`);

    if (prompt.length > 32000) { // Dodatkowy check, na wszelki wypadek
        console.warn(`[${operationId}] [${chunkLabel}] Prompt is very long (${prompt.length}). Potential issues.`);
    }

    updateChunkProgress(operationId, currentChunk, totalChunks, 30, `Sending ${chunkLabel} to AI`);

    // Wywołanie AI
    const { text: analysisResponse } = await generateText({
      model: groq('llama-3.3-70b-specdec'), // Upewnij się, że model jest odpowiedni
      prompt: prompt,
      temperature: 0.3, // Nieco wyższa temperatura może dać bardziej zróżnicowane wyniki
      maxTokens: 4096, // Zwiększamy, jeśli oczekujemy dłuższych odpowiedzi JSON
    });

    console.log(`[${operationId}] [${chunkLabel}] Received response from AI.`);
    updateChunkProgress(operationId, currentChunk, totalChunks, 70, `Processing ${chunkLabel} response`);

    // Parsowanie odpowiedzi za pomocą funkcji z utils
    const parsedResponse = await cleanAndParseAIResponse(analysisResponse);

    if (!parsedResponse) {
      console.error(`[${operationId}] [${chunkLabel}] Failed to parse AI response.`);
      updateChunkProgress(operationId, currentChunk, totalChunks, 100, `Error processing ${chunkLabel}`);
      // Zwróć pusty wynik dla tej części, aby nie zablokować całości
      return createEmptyResult(title, `Failed to parse AI response for chunk ${currentChunk}.`);
    }

    console.log(`[${operationId}] [${chunkLabel}] Successfully parsed AI response.`);
    updateChunkProgress(operationId, currentChunk, totalChunks, 100, `Completed ${chunkLabel}`);

    // Mapowanie sparsowanej odpowiedzi do finalnego typu VideoAnalysisResult
    // Tutaj zakładamy, że `parsedResponse` ma strukturę zgodną z `ParsedAIResponse`
    return {
      title: title, // Używamy oryginalnego tytułu
      summary: parsedResponse.summary || "No summary provided.",
      keyPoints: parsedResponse.keyPoints || [],
      actionItems: parsedResponse.actionItems || [],
      decisionsMade: parsedResponse.decisionsMade || [],
      videoChapters: parsedResponse.videoChapters || [],
      presentationQuality: parsedResponse.presentationQuality || { overallClarity: "N/A", difficultSegments: [], improvementSuggestions: [] },
      glossary: parsedResponse.glossary || {},
    };

  } catch (error) {
    console.error(`[${operationId}] [${chunkLabel}] Error during chunk analysis:`, error);
    updateChunkProgress(operationId, currentChunk, totalChunks, 100, `Error analyzing ${chunkLabel}`);

    // Logowanie błędu specyficznego dla AI (np. context length)
     if (error instanceof Error && error.message.includes("context_length_exceeded")) {
        console.error(`[${operationId}] [${chunkLabel}] AI context length exceeded.`);
        // Można by tu zaimplementować logikę ponownej próby z jeszcze krótszym promptem,
        // ale na razie zwracamy błąd.
     }

    // Zwracamy pusty wynik z informacją o błędzie dla tej części
    return createEmptyResult(title, `Error analyzing chunk ${currentChunk}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// --- Funkcja tworząca prompt dla AI ---

/**
 * Tworzy prompt dla AI na podstawie części transkrypcji.
 * Wymusza odpowiedź w języku angielskim i użycie standardowych znaków ASCII w JSON.
 */
function createAnalysisPrompt(
  transcriptionChunk: Transcription,
  // outputLanguage: string // Ten parametr nie będzie już wpływał na język TREŚCI JSON
): string {
  // Przygotowanie danych transkrypcji do promptu (logika bez zmian)
  const MAX_SEGMENTS_IN_PROMPT = 150;
  const MAX_TEXT_LENGTH_IN_PROMPT = 25000;

  let segmentsForPrompt = transcriptionChunk.segments;
  let textForPrompt = transcriptionChunk.text;

  if (segmentsForPrompt.length > MAX_SEGMENTS_IN_PROMPT) {
      console.warn(`Limiting segments in prompt from ${segmentsForPrompt.length} to ${MAX_SEGMENTS_IN_PROMPT}`);
      const step = Math.max(1, Math.floor(segmentsForPrompt.length / MAX_SEGMENTS_IN_PROMPT));
      segmentsForPrompt = segmentsForPrompt.filter((_, index) => index % step === 0);
      textForPrompt = segmentsForPrompt.map(s => s.text).join(' ');
  }

  if (textForPrompt.length > MAX_TEXT_LENGTH_IN_PROMPT) {
      console.warn(`Limiting text length in prompt from ${textForPrompt.length} to ${MAX_TEXT_LENGTH_IN_PROMPT}`);
      textForPrompt = textForPrompt.substring(0, MAX_TEXT_LENGTH_IN_PROMPT) + "... [TRUNCATED]";
  }

  const simplifiedSegments = segmentsForPrompt.map(s => ({
      s: formatTime(s.start), // start time hh:mm:ss
      e: formatTime(s.end),   // end time hh:mm:ss
      t: s.text             // text
  }));

  // Zaktualizowany prompt z wymuszeniem angielskiego i standardowych znaków ASCII
  const prompt = `
You are an expert meeting and lecture analyst. Your task is to analyze the provided audio transcription excerpt and generate a DETAILED and ACCURATE analysis in JSON format ONLY.

**CRITICAL Analysis Requirements:**

1.  **LANGUAGE:** **ALL text values** within the generated JSON object (summaries, titles, descriptions, issues, suggestions, glossary definitions, etc.) **MUST be in ENGLISH**.
2.  **CHARACTER SET:** Use **ONLY standard English alphabet characters (a-z, A-Z), numbers (0-9), and common punctuation** (, . : ; ' " ! ? - _ /). **Strictly AVOID** any special characters, emojis, non-ASCII characters (like accented letters, umlauts, etc.), or control characters. Ensure the output is clean and easily parsable.
3.  **Time Format:** All timestamps MUST be in "hh:mm:ss" format. Calculate these based on the start/end times (in seconds) provided in the segments.
4.  **JSON Output:** Return ONLY a valid JSON object. Do NOT include any introductory text, markdown formatting (like \`\`\`json), code block fences, or explanations outside the JSON structure itself.
5.  **REQUIRED FIELDS:** You MUST provide content for ALL fields in the JSON structure, including videoChapters and glossary, even if you need to create minimal or generic content.

**Required JSON Structure (Ensure all string values adhere to ENGLISH language and standard ASCII character set rules):**

\`\`\`json
{
"summary": "A comprehensive and detailed summary of this transcription excerpt (15-20 sentences). Be thorough in your analysis, covering all important details and explaining any complex concepts. Ensure the summary is informative and provides substantial value to someone who hasn't heard the audio. ENGLISH ONLY. Standard ASCII.",
"keyPoints": [
  "Identify the main topic/subject discussed. ENGLISH ONLY. Standard ASCII.",
  "List another significant theme or question raised. ENGLISH ONLY. Standard ASCII.",
  "... (list up to 5-7 distinct key topics/themes)"
],
"actionItems": [
  {
    "person": "Identify the person assigned (if mentioned, otherwise 'Unassigned'). ENGLISH ONLY. Standard ASCII.",
    "task": "Describe the specific action item or task. ENGLISH ONLY. Standard ASCII.",
    "dueDate": "Mention the due date or timeframe if specified (e.g., 'Next week', '2025-05-15', 'optional'). ENGLISH ONLY. Standard ASCII."
  }
  "... (list all identified action items)"
],
"decisionsMade": [
  "List a specific decision reached. ENGLISH ONLY. Standard ASCII.",
  "... (list all clear decisions made)"
],
"videoChapters": [
  {
    "startTime": "hh:mm:ss", // Start time of the chapter/section
    "endTime": "hh:mm:ss",   // End time of the chapter/section
    "title": "Create a short, descriptive title (e.g., 'Introduction', 'Budget Review', 'Q and A Session'). ENGLISH ONLY. Standard ASCII.",
    "description": "A brief one-sentence description of this section. ENGLISH ONLY. Standard ASCII."
  }
  "... (ALWAYS identify 3-7 meaningful chapters, even for short recordings or simple content. Divide the content logically by topic or time.)"
],
"presentationQuality": {
  "overallClarity": "Provide a brief assessment of clarity and organization. ENGLISH ONLY. Standard ASCII.",
  "difficultSegments": [
    {
      "startTime": "hh:mm:ss",
      "endTime": "hh:mm:ss",
      "issue": "Describe the communication issue (e.g., 'Unclear explanation', 'Confusing terminology'). ENGLISH ONLY. Standard ASCII.",
      "improvement": "Suggest a specific improvement (optional). ENGLISH ONLY. Standard ASCII."
    }
  ],
  "improvementSuggestions": [
    "List general suggestion for improving clarity or delivery. ENGLISH ONLY. Standard ASCII."
  ]
},
"glossary": {
  "term1": "Definition or explanation for this term or phrase. ENGLISH ONLY. Standard ASCII.",
  "term2": "Definition or explanation for this term or phrase. ENGLISH ONLY. Standard ASCII.",
  "... (ALWAYS identify at least 5-10 terms with definitions, even if they are general terms from the content)"
}
\`\`\`

Use the provided audio segments to analyze. This might be only a portion of a longer recording:

SEGMENTS: ${JSON.stringify(simplifiedSegments)}

TRANSCRIPTION TEXT: 
${textForPrompt}

Remember: Return valid JSON ONLY, using ENGLISH language and standard ASCII characters only.
`;

  return prompt;
}

// --- Funkcja pomocnicza do tworzenia pustego wyniku w razie błędu ---
function createEmptyResult(title: string, errorMessage: string): VideoAnalysisResult {
    return {
        title: title,
        summary: `Analysis Error: ${errorMessage}`,
        keyPoints: [],
        actionItems: [],
        decisionsMade: [],
        videoChapters: [],
        presentationQuality: { overallClarity: "N/A", difficultSegments: [], improvementSuggestions: [] },
        glossary: {}
    };
}