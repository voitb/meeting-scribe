import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import {
	cleanAndParseAIResponse,
	splitTranscriptionIntoChunks,
	mergeAnalysisResults,
	formatTime,
} from "../analysis-utils";
import { VideoAnalysisResult } from "@/types/analysis.types";
import { Transcription } from "@/types/analysis.types";
import {
	markAsCompleted,
	markAsError,
	updateChunkProgress,
} from "../progress-store";

// --- Main analysis function ---

/**
 * Analyzes the audio transcription, splitting it into parts if necessary,
 * sending to AI and combining the results.
 */
export async function analyzeTranscription(
	title: string,
	transcription: Transcription,
	outputLanguage: string = "english",
	audioId?: string // ID for tracking progress
): Promise<VideoAnalysisResult> {
	const operationId = audioId || `analysis-${Date.now()}`; // Use provided ID or generate one
	console.log(
		`[${operationId}] Starting transcription analysis for "${title}"...`
	);

	try {
		if (
			!transcription ||
			!transcription.segments ||
			transcription.segments.length === 0
		) {
			console.warn(
				`[${operationId}] Transcription has no segments. Returning minimal result.`
			);
			markAsCompleted(operationId, "Analysis completed (no segments)");
			return createEmptyResult(title, "Transcription contains no segments.");
		}

		console.log(
			`[${operationId}] Total segments: ${transcription.segments.length}, Total text length: ${transcription.text?.length || 0} chars`
		);

		// Using utilities function to split into parts
		const MAX_SEGMENTS_PER_CHUNK = 50; // Can be adjusted
		const MAX_TEXT_LENGTH_PER_CHUNK = 15000; // Character limit per part (safe margin)
		const chunks = splitTranscriptionIntoChunks(
			transcription,
			MAX_SEGMENTS_PER_CHUNK,
			MAX_TEXT_LENGTH_PER_CHUNK
		);
		const totalChunks = chunks.length;

		if (totalChunks === 0) {
			console.error(
				`[${operationId}] Splitting resulted in zero chunks. Cannot proceed.`
			);
			markAsError(
				operationId,
				"Error: Failed to split transcription into chunks."
			);
			return createEmptyResult(title, "Error during transcription splitting.");
		}

		console.log(
			`[${operationId}] Split into ${totalChunks} chunk(s) for analysis.`
		);

		const analysisPromises: Promise<VideoAnalysisResult>[] = [];

		for (let i = 0; i < totalChunks; i++) {
			const chunk = chunks[i];
			const chunkNumber = i + 1;

			// Starting asynchronous analysis for each part
			analysisPromises.push(
				analyzeTranscriptionChunk(
					title, // Passing original title
					chunk,
					outputLanguage,
					operationId,
					chunkNumber,
					totalChunks
				)
			);
		}

		// Waiting for all analyses to complete
		const results = await Promise.all(analysisPromises);

		// Combining results
		console.log(
			`[${operationId}] Merging results from ${results.length} chunk(s)...`
		);
		const mergedResult = mergeAnalysisResults(results, title); // Using utility function

		markAsCompleted(operationId, "Analysis completed successfully");
		console.log(`[${operationId}] Analysis finished successfully.`);
		return mergedResult;
	} catch (error) {
		console.error(
			`[${operationId}] Critical error during analyzeTranscription:`,
			error
		);
		markAsError(
			operationId,
			`Analysis failed: ${error instanceof Error ? error.message : String(error)}`
		);
		// Returning empty result with error information
		return createEmptyResult(
			title,
			`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}

// --- Function analyzing a single transcription part ---

/**
 * Analyzes a single transcription part by sending it to AI.
 */
async function analyzeTranscriptionChunk(
	title: string, // Original title is needed for context but doesn't have to be in AI result
	transcriptionChunk: Transcription,
	outputLanguage: string,
	operationId: string, // Using operation ID for logging and progress
	currentChunk: number,
	totalChunks: number
): Promise<VideoAnalysisResult> {
	const chunkLabel = `Chunk ${currentChunk}/${totalChunks}`;
	console.log(`[${operationId}] [${chunkLabel}] Starting analysis...`);

	try {
		updateChunkProgress(
			operationId,
			currentChunk,
			totalChunks,
			10,
			`Preparing ${chunkLabel}`
		);

		// Creating prompt using dedicated function
		const prompt = createAnalysisPrompt(transcriptionChunk);
		console.log(
			`[${operationId}] [${chunkLabel}] Prompt created (length: ${prompt.length}).`
		);

		if (prompt.length > 32000) {
			// Additional check, just in case
			console.warn(
				`[${operationId}] [${chunkLabel}] Prompt is very long (${prompt.length}). Potential issues.`
			);
		}

		updateChunkProgress(
			operationId,
			currentChunk,
			totalChunks,
			30,
			`Sending ${chunkLabel} to AI`
		);

		// AI call
		const { text: analysisResponse } = await generateText({
			model: groq("llama-3.3-70b-versatile"), // Make sure the model is appropriate
			prompt: prompt,
			temperature: 0.3, // Slightly higher temperature may give more varied results
			maxTokens: 4096, // Increase if expecting longer JSON responses
		});

		console.log(`[${operationId}] [${chunkLabel}] Received response from AI.`);
		updateChunkProgress(
			operationId,
			currentChunk,
			totalChunks,
			70,
			`Processing ${chunkLabel} response`
		);

		// Parsing response using utility function
		const parsedResponse = await cleanAndParseAIResponse(analysisResponse);

		if (!parsedResponse) {
			console.error(
				`[${operationId}] [${chunkLabel}] Failed to parse AI response.`
			);
			updateChunkProgress(
				operationId,
				currentChunk,
				totalChunks,
				100,
				`Error processing ${chunkLabel}`
			);
			// Return empty result for this part to avoid blocking the whole
			return createEmptyResult(
				title,
				`Failed to parse AI response for chunk ${currentChunk}.`
			);
		}

		console.log(
			`[${operationId}] [${chunkLabel}] Successfully parsed AI response.`
		);
		updateChunkProgress(
			operationId,
			currentChunk,
			totalChunks,
			100,
			`Completed ${chunkLabel}`
		);

		// Mapping parsed response to final VideoAnalysisResult type
		// Here we assume that `parsedResponse` has a structure compatible with `ParsedAIResponse`
		return {
			title: title, // Using original title
			summary: parsedResponse.summary || "No summary provided.",
			keyPoints: parsedResponse.keyPoints || [],
			actionItems: parsedResponse.actionItems || [],
			decisionsMade: parsedResponse.decisionsMade || [],
			videoChapters: parsedResponse.videoChapters || [],
			presentationQuality: parsedResponse.presentationQuality || {
				overallClarity: "N/A",
				difficultSegments: [],
				improvementSuggestions: [],
			},
			glossary: parsedResponse.glossary || {},
		};
	} catch (error) {
		console.error(
			`[${operationId}] [${chunkLabel}] Error during chunk analysis:`,
			error
		);
		updateChunkProgress(
			operationId,
			currentChunk,
			totalChunks,
			100,
			`Error analyzing ${chunkLabel}`
		);

		// Logging AI-specific error (e.g. context length)
		if (
			error instanceof Error &&
			error.message.includes("context_length_exceeded")
		) {
			console.error(
				`[${operationId}] [${chunkLabel}] AI context length exceeded.`
			);
			// Could implement retry logic with an even shorter prompt here,
			// but for now we return an error.
		}

		// Returning empty result with error information for this part
		return createEmptyResult(
			title,
			`Error analyzing chunk ${currentChunk}: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

// --- Function creating prompt for AI ---

/**
 * Creates a prompt for AI based on transcription part.
 * Forces English response and use of standard ASCII characters in JSON.
 */
function createAnalysisPrompt(
	transcriptionChunk: Transcription
	// outputLanguage: string // This parameter will no longer affect the JSON CONTENT language
): string {
	// Preparing transcription data for prompt (logic unchanged)
	const MAX_SEGMENTS_IN_PROMPT = 150;
	const MAX_TEXT_LENGTH_IN_PROMPT = 25000;

	let segmentsForPrompt = transcriptionChunk.segments;
	let textForPrompt = transcriptionChunk.text;

	if (segmentsForPrompt.length > MAX_SEGMENTS_IN_PROMPT) {
		console.warn(
			`Limiting segments in prompt from ${segmentsForPrompt.length} to ${MAX_SEGMENTS_IN_PROMPT}`
		);
		const step = Math.max(
			1,
			Math.floor(segmentsForPrompt.length / MAX_SEGMENTS_IN_PROMPT)
		);
		segmentsForPrompt = segmentsForPrompt.filter(
			(_, index) => index % step === 0
		);
		textForPrompt = segmentsForPrompt.map((s) => s.text).join(" ");
	}

	if (textForPrompt.length > MAX_TEXT_LENGTH_IN_PROMPT) {
		console.warn(
			`Limiting text length in prompt from ${textForPrompt.length} to ${MAX_TEXT_LENGTH_IN_PROMPT}`
		);
		textForPrompt =
			textForPrompt.substring(0, MAX_TEXT_LENGTH_IN_PROMPT) + "... [TRUNCATED]";
	}

	const simplifiedSegments = segmentsForPrompt.map((s) => ({
		s: formatTime(s.start), // start time hh:mm:ss
		e: formatTime(s.end), // end time hh:mm:ss
		t: s.text, // text
	}));

	// Updated prompt forcing English and standard ASCII characters
	const prompt = `
You are an expert meeting and lecture analyst. Your task is to analyze the provided audio transcription excerpt and generate a DETAILED and ACCURATE analysis in JSON format ONLY.

**CRITICAL Analysis Requirements:**

1.  **LANGUAGE:** **ALL text values** within the generated JSON object (summaries, titles, descriptions, issues, suggestions, glossary definitions, etc.) **MUST be in ENGLISH**.
2.  **CHARACTER SET:** Use **ONLY standard English alphabet characters (a-z, A-Z), numbers (0-9), and common punctuation** (, . : ; ' " ! ? - _ /). **Strictly AVOID** any special characters, emojis, non-ASCII characters (like accented letters, umlauts, etc.), or control characters. Ensure the output is clean and easily parsable.
3.  **Time Format:** All timestamps MUST be in "hh:mm:ss" format. Calculate these based on the start/end times (in seconds) provided in the segments.
4.  **JSON Output:** Return ONLY a valid JSON object. Do NOT include any introductory text, markdown formatting (like \`\`\`json), code block fences, or explanations outside the JSON structure itself.
5.  **PERSON NAME EXCLUSION:** Do NOT include any names of persons or any personal name references in any field of the JSON output. Replace or omit any names that may appear in the transcription.
6.  **REQUIRED FIELDS:** You MUST provide content for ALL fields in the JSON structure, including videoChapters and glossary, even if you need to create minimal or generic content.

**Required JSON Structure (Ensure all string values adhere to ENGLISH language and standard ASCII character set rules):**

\`\`\`json
{
  "summary": "A comprehensive and detailed summary of this transcription excerpt (not less than 25 sentences, no more than 30 sentences, but if you have nothing to add anymore then you can stop and return less than 25 sentences). Be thorough in your analysis, covering all important details and explaining any complex concepts. Ensure the summary is informative and provides substantial value to someone who has not heard the audio. ENGLISH ONLY. Standard ASCII. You need to be very detailed and specific, creating an advanced summary that can be used as a basis for a video script",
  "keyPoints": [
    "Identify the main topic or subject discussed. ENGLISH ONLY. Standard ASCII.",
    "List another significant theme or question raised. ENGLISH ONLY. Standard ASCII.",
    "... (list up to 5-7 distinct key topics or themes)"
  ],
  "actionItems": [
    {
      "task": "Describe the specific action item or task to be completed. ENGLISH ONLY. Standard ASCII.",
      "dueDate": "Mention the due date or timeframe if specified (e.g., 'Next week', '2025-05-15', 'optional'). If no date is mentioned, leave blank. ENGLISH ONLY. Standard ASCII."
    }
    "... (list all identified action items or tasks to complete, WITHOUT attributing to specific people)"
  ],
  "decisionsMade": [
    "List a specific decision reached. ENGLISH ONLY. Standard ASCII.",
    "... (list all clear decisions made)"
  ],
  "videoChapters": [
    {
      "startTime": "hh:mm:ss", // Start time of the chapter or section
      "endTime": "hh:mm:ss",   // End time of the chapter or section
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
}
\`\`\`

Use the provided audio segments to analyze. This might be only a portion of a longer recording:

SEGMENTS: ${JSON.stringify(simplifiedSegments)}

TRANSCRIPTION TEXT: 
${textForPrompt}

Remember: Return valid JSON ONLY, using ENGLISH language and standard ASCII characters only, and ensure that no person names or personal name references are included.
`;

	return prompt;
}

// --- Helper function for creating empty result in case of error ---
function createEmptyResult(
	title: string,
	errorMessage: string
): VideoAnalysisResult {
	return {
		title: title,
		summary: `Analysis Error: ${errorMessage}`,
		keyPoints: [],
		actionItems: [],
		decisionsMade: [],
		videoChapters: [],
		presentationQuality: {
			overallClarity: "N/A",
			difficultSegments: [],
			improvementSuggestions: [],
		},
		glossary: {},
	};
}
