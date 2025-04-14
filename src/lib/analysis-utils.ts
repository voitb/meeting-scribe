import type { Transcription, VideoAnalysisResult, ParsedAIResponse,} from '@/types/analysis.types'

// --- Functions for cleaning and parsing AI responses ---

/**
 * Cleans the text response from AI, attempting to isolate and parse the JSON block.
 */
export async function cleanAndParseAIResponse(responseText: string): Promise<ParsedAIResponse | null> {
  console.log("Attempting to clean and parse AI response...");
  let cleanedResponse = responseText;

  const extractJsonBlock = (text: string): string => {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      return text.substring(startIndex, endIndex + 1);
    }
    // Fallback: try to find JSON within markdown
    const codeBlockRegex = /```(?:json)?([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    if (match && match[1]) {
        const innerJsonMatch = match[1].match(/\{[\s\S]*\}/);
        if (innerJsonMatch) return innerJsonMatch[0];
    }
    return text; // Return original if no clear JSON block found
  };

  cleanedResponse = extractJsonBlock(cleanedResponse);

  // Remove control characters and normalize newlines
  cleanedResponse = cleanedResponse
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/\\(?!["\\/bfnrt])/g, "\\\\") // Fix potentially problematic backslashes
    .replace(/([^\\])\\([^"\\/bfnrtu])/g, "$1\\\\$2") // Fix escaped quotes incorrectly formatted
    .replace(/([^\\])\\'/g, "$1\\\\'"); // Fix escaped single quotes

  try {
    console.log("Attempting to parse cleaned response as JSON.");
    return JSON.parse(cleanedResponse) as ParsedAIResponse;
  } catch (error) {
    console.warn("Initial JSON parsing failed:", error);
    console.log("Attempting to fix JSON structure...");
    const fixedResponse = attemptToFixJsonStructure(cleanedResponse);
    try {
      console.log("Attempting to parse fixed JSON structure.");
      return JSON.parse(fixedResponse) as ParsedAIResponse;
    } catch (fixError) {
      console.error("Failed to parse even the fixed JSON:", fixError);
      console.error("Problematic JSON string:", cleanedResponse); // Log the problematic string
      // Attempt to extract summary if possible as a last resort
      if(!cleanedResponse.includes('{') || !cleanedResponse.includes('}')) {
          console.log("Response lacks JSON structure. Returning text as summary.");
          return { summary: cleanedResponse.substring(0, 2000), keyPoints: [], actionItems: [], decisionsMade: [], videoChapters: [] };
      }
      return null; // Indicate failure to parse
    }
  }
}

/**
 * Attempts to fix common errors in JSON string.
 */
function attemptToFixJsonStructure(jsonString: string): string {
  let result = jsonString.trim();

  // Remove trailing commas before closing braces/brackets
  result = result.replace(/,\s*}/g, '}');
  result = result.replace(/,\s*]/g, ']');

  // Add missing closing braces/brackets (basic attempt)
  const openBraces = (result.match(/\{/g) || []).length;
  const closeBraces = (result.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    result += '}'.repeat(openBraces - closeBraces);
  }

  const openBrackets = (result.match(/\[/g) || []).length;
  const closeBrackets = (result.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    result += ']'.repeat(openBrackets - closeBrackets);
  }

  // Note: More complex fixes like handling unquoted keys or incorrect string escapes
  // are harder to generalize and might corrupt valid data. This focuses on common structural issues.

  return result;
}


// --- Functions for splitting transcriptions and combining results ---

/**
 * Splits a long transcription into smaller parts, considering segment limit and text length.
 */
export function splitTranscriptionIntoChunks(transcription: Transcription, maxSegmentsPerChunk: number = 50, maxTextLengthPerChunk: number = 15000): Transcription[] {
  if (!transcription.segments || transcription.segments.length === 0) {
    console.log("No segments found in transcription.");
    return [transcription]; // Return as is if no segments
  }

  const totalSegments = transcription.segments.length;
  const totalTextLength = transcription.text?.length || 0;

  console.log(`Transcription details: ${totalSegments} segments, ${totalTextLength} characters.`);

  // Check if chunking is needed based on segment count or text length
  if (totalSegments <= maxSegmentsPerChunk && totalTextLength <= maxTextLengthPerChunk) {
    console.log("Transcription size within limits. No chunking required.");
    return [transcription];
  }

  console.log(`Chunking needed. Max segments/chunk: ${maxSegmentsPerChunk}, Max text length/chunk: ${maxTextLengthPerChunk}`);

  const chunks: Transcription[] = [];
  let currentSegmentIndex = 0;

  while (currentSegmentIndex < totalSegments) {
    let chunkEndIndex = Math.min(currentSegmentIndex + maxSegmentsPerChunk, totalSegments);
    let currentChunkTextLength = 0;
    let segmentCountInChunk = 0;

    // Determine chunk end based on segment count and text length
    for (let i = currentSegmentIndex; i < chunkEndIndex; i++) {
      const segmentTextLength = transcription.segments[i].text?.length || 0;
      if (currentChunkTextLength + segmentTextLength > maxTextLengthPerChunk && segmentCountInChunk > 5) { // Ensure chunk isn't too small
          chunkEndIndex = i; // End before this segment
          console.log(`Chunk limit reached by text length at index ${i}.`);
          break;
      }
      currentChunkTextLength += segmentTextLength;
      segmentCountInChunk++;
    }

     // Ensure we don't create an empty chunk if the loop breaks early
     if (chunkEndIndex <= currentSegmentIndex) {
        chunkEndIndex = currentSegmentIndex + 1; // Take at least one segment
        console.warn("Forcing chunk end index to avoid empty chunk.");
     }


    const segmentsChunk = transcription.segments.slice(currentSegmentIndex, chunkEndIndex);

    if (segmentsChunk.length === 0) {
        console.error("Attempted to create an empty chunk. Breaking loop.");
        break; // Avoid infinite loop if something went wrong
    }


    const chunkStartTime = segmentsChunk[0].start;
    const chunkEndTime = segmentsChunk[segmentsChunk.length - 1].end;

    const chunkText = segmentsChunk.map(segment => segment.text).join(' ');
    const chunkWords = transcription.words?.filter(word => word.start >= chunkStartTime && word.end <= chunkEndTime) || [];

    const chunkTranscription: Transcription = {
      ...transcription, // Copy metadata
      segments: segmentsChunk,
      text: chunkText,
      words: chunkWords,
      // Adjust duration if needed, though less critical for chunks
      duration: chunkEndTime - chunkStartTime,
    };

    chunks.push(chunkTranscription);
    console.log(`Created chunk ${chunks.length}: Segments ${currentSegmentIndex + 1}-${chunkEndIndex} (${segmentsChunk.length} segments, ${chunkText.length} chars)`);

    currentSegmentIndex = chunkEndIndex; // Move to the next segment
  }

  console.log(`Successfully split into ${chunks.length} chunks.`);
  return chunks;
}

/**
 * Combines analysis results from multiple transcription parts into one coherent result.
 */
export function mergeAnalysisResults(results: VideoAnalysisResult[], originalTitle: string): VideoAnalysisResult {
  if (!results || results.length === 0) {
    console.error("Cannot merge empty results array.");
    // Return a default empty structure or throw an error
    return {
        title: originalTitle,
        summary: "Error: No analysis results to merge.",
        keyPoints: [],
        actionItems: [],
        decisionsMade: [],
        videoChapters: [],
        presentationQuality: { overallClarity: "N/A", difficultSegments: [], improvementSuggestions: [] },
        glossary: {}
    };
  }

  if (results.length === 1) {
    console.log("Only one result, no merging needed.");
    return results[0];
  }

  console.log(`Merging ${results.length} analysis results...`);

  const merged: VideoAnalysisResult = {
    title: originalTitle,
    summary: results.map(r => r.summary).filter(Boolean).join("\n\n---\n\n"), // Combine summaries, separated
    keyPoints: Array.from(new Set(results.flatMap(r => r.keyPoints || []))), // Unique key topics
    actionItems: results.flatMap(r => r.actionItems || []), // Combine all action items
    decisionsMade: Array.from(new Set(results.flatMap(r => r.decisionsMade || []))), // Unique decisions
    videoChapters: results
        .flatMap(r => r.videoChapters || [])
        .sort((a, b) => timeToSeconds(a.startTime) - timeToSeconds(b.startTime)), // Combine and sort chapters
    presentationQuality: {
        overallClarity: results.map(r => r.presentationQuality?.overallClarity).filter(Boolean).join("\n"), // Combine clarity assessments
        difficultSegments: results.flatMap(r => r.presentationQuality?.difficultSegments || []), // Combine difficult segments
        improvementSuggestions: Array.from(new Set(results.flatMap(r => r.presentationQuality?.improvementSuggestions || []))) // Unique suggestions
    },
    glossary: results.reduce((acc, curr) => ({ ...acc, ...(curr.glossary || {}) }), {}) // Merge glossaries, later entries overwrite earlier ones for the same term
  };

  console.log("Merging completed.");
  return merged;
}

/** Helper function to convert hh:mm:ss or mm:ss to seconds for sorting */
function timeToSeconds(timeStr: string): number {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) { // hh:mm:ss
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // mm:ss
        seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) { // ss
        seconds = parts[0];
    }
    return isNaN(seconds) ? 0 : seconds;
}

/** Helper function to convert seconds to "hh:mm:ss" format */
export function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "00:00:00";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}