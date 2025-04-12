import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai'; 

export type VideoAnalysisResult = {
  title: string;
  summary: string;
  keyPoints: string[];
  videoChapters: VideoChapter[];
  presentationQuality: {
    overallClarity: string;
    difficultSegments: {
      startTime: string;
      endTime: string;
      issue: string;
      improvement: string;
    }[];
    improvementSuggestions: string[];
  };
  glossary: Record<string, string>;
}

export type VideoChapter = {
  startTime: string;
  endTime: string;
  title: string;
  description: string;
}

interface ParsedAIResponse {
  summary: string;
  keyPoints: string[];
  discussionQuestions: string[];
  videoChapters?: VideoChapter[];
  videoPoints?: VideoChapter[];
  glossary?: Record<string, string>;
  presentationQuality?: {
    overallClarity: string;
    difficultSegments: {
      startTime: string;
      endTime: string;
      issue: string;
      improvement: string;
    }[];
    improvementSuggestions: string[];
  };
  [key: string]: unknown;
}

export interface Transcription {
  task: string;
  language: string;
  duration: number;
  text: string;
  words: Word[];
  segments: Segment[];
  x_groq: {
      id: string;
  };
}

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Segment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export async function cleanAndParseAIResponse(responseText: string): Promise<ParsedAIResponse> {
  let cleanedResponse = responseText;
  
  const extractJsonBlock = (text: string): string => { 
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      return text.substring(startIndex, endIndex + 1);
    }
    return text;
  };
  
  if (cleanedResponse.includes("```")) {
    const codeBlockRegex = /```(?:json)?([\s\S]*?)```/;
    const match = cleanedResponse.match(codeBlockRegex);
    
    if (match && match[1]) {
      cleanedResponse = match[1].trim();
      console.log("Extracted code block content");
      cleanedResponse = extractJsonBlock(cleanedResponse);
    } else {
      cleanedResponse = cleanedResponse.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      console.log("Removed markdown code block tags");
      cleanedResponse = extractJsonBlock(cleanedResponse);
    }
  } else {
    cleanedResponse = extractJsonBlock(cleanedResponse);
  }
  
  cleanedResponse = cleanedResponse
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/\\(?!["\\/bfnrt])/g, "\\\\")
    .replace(/([^\\])\\([^"\\/bfnrtu])/g, "$1\\\\$2")
    .replace(/([^\\])\\'/g, "$1\\\\'");
  
  try {
    console.log("Attempting to parse cleaned response as JSON");
    return JSON.parse(cleanedResponse) as ParsedAIResponse;
  } catch (error) {
    console.error("Error parsing JSON after cleaning:", error);
    
    const fixedResponse = attemptToFixJsonStructure(cleanedResponse);
    if (fixedResponse !== cleanedResponse) {
      try {
        console.log("Attempting to parse fixed JSON structure");
        return JSON.parse(fixedResponse) as ParsedAIResponse;
      } catch (fixError) {
        console.error("Failed to parse fixed JSON:", fixError);
      }
    }
    
    if (!cleanedResponse.includes('{') || !cleanedResponse.includes('}')) {
      console.log("Response doesn't contain JSON structure, attempting to create a simple response");
      const simpleResponse: ParsedAIResponse = {
        summary: cleanedResponse,
        keyPoints: [],
        discussionQuestions: [],
        videoChapters: []
      };
      return simpleResponse;
    }
    
    console.log("Attempting to extract JSON structure using regex");
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log("Found potential JSON structure");
      try {
        const extractedJson = jsonMatch[0]
          .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "")
          .replace(/\r\n|\n|\r/g, " ")
          .replace(/\\(?!["\\/bfnrt])/g, "\\\\")
          .replace(/([^\\])\\([^"\\/bfnrtu])/g, "$1\\\\$2")
          .replace(/([^\\])\\'/g, "$1\\\\'");
        
        return JSON.parse(extractedJson) as ParsedAIResponse;
      } catch (error) {
        console.error("Failed to parse extracted JSON structure:", error);
        
        console.log("Falling back to default response structure");
        const fallbackResponse: ParsedAIResponse = {
          summary: cleanedResponse.substring(0, 2000),
          keyPoints: [],
          discussionQuestions: [],
          videoChapters: []
        };
        return fallbackResponse;
      }
    } else {
      console.error("No JSON format found in response:", cleanedResponse);
      
      console.log("Creating fallback response with the text as summary");
      return {
        summary: cleanedResponse.substring(0, 2000),
        keyPoints: [],
        discussionQuestions: [],
        videoChapters: []
      };
    }
  }
}

function attemptToFixJsonStructure(jsonString: string): string {
  let result = jsonString;
  
  result = result.replace(/,\s*,/g, ',');
  
  result = result.replace(/,\s*}/g, '}');
  result = result.replace(/,\s*]/g, ']');
  
  result = result.replace(/([^\\])"([^"]*?)([^\\])"/g, '$1"$2$3\\"');
  
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
  
  return result;
}

export async function analyzeTranscription(
  title: string, 
  transcription: Transcription, 
  outputLanguage: string = "english"
): Promise<VideoAnalysisResult> {
  console.log("Starting text analysis with Groq model");

  const prompt = `
You are an expert in analyzing lectures and podcasts, creating high-quality educational materials.

IMPORTANT - TIME FORMAT (hh:mm:ss):
1. In the transcription, time is given in seconds.
2. In your final answer, all "startTime" and "endTime" values MUST be in the "hh:mm:ss" format (hours:minutes:seconds).
3. Convert the original seconds from the transcription exactly into hh:mm:ss (no rounding, no shortening).

Your task:

1. **Provide a detailed summary** of the recording (between 30 and 50 sentences).
2. **List 5-7 key points** or concepts discussed in the material.
3. **Divide the recording into 5-10 chapters** ("videoChapters") covering the entire content from "00:00:00" to the last second of the recording:
   - Each chapter MUST last at least 2-3 minutes (preferably 5-15 minutes).
   - Chapters should represent major, coherent topics (avoid very short sections).
   - Calculate the "startTime" and "endTime" of the chapters from the segment "start" and "end" times (in seconds) provided in the transcription — then convert them to hh:mm:ss.
   - Make sure the chapters together cover the entire time range (from "00:00:00" to the maximum end time), with no gaps.

4. **Assess the presentation quality**:
   - Provide an overall assessment of clarity (overallClarity).
   - Identify up to 5 challenging segments (provide their time ranges in hh:mm:ss), describe the issue (issue), and propose an improvement (improvement).
   - Add general suggestions (improvementSuggestions) for enhancing the presentation.

5. **Create a glossary (glossary)**:
   - List ONLY the terms that are actually defined or explained in the recording.
   - For each term, provide a short explanation/definition and the approximate time (hh:mm:ss) where the explanation appears.

**NOTE**: In your response, **only** return a properly formatted JSON object, with no additional markings. The structure must look exactly like this (use your own content within the keys):

{
  "summary": "Place your detailed summary here...",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    ...
  ],
  "videoChapters": [
    {
      "startTime": "00:00:00",
      "endTime": "00:10:00",
      "title": "Chapter title",
      "description": "Short description"
    },
    ...
  ],
  "presentationQuality": {
    "overallClarity": "Overall assessment of clarity and effectiveness",
    "difficultSegments": [
      {
        "startTime": "00:00:00",
        "endTime": "00:03:00",
        "issue": "Issue description",
        "improvement": "Suggested improvement"
      },
      ...
    ],
    "improvementSuggestions": [
      "Suggestion 1",
      "Suggestion 2",
      ...
    ]
  },
  "glossary": {
    "Term 1": "Definition + approximate time (hh:mm:ss)",
    "Term 2": "Definition + approximate time (hh:mm:ss)"
  }
}

Remember:
- No other tags, text, or comments - just JSON.
- Every "startTime" and "endTime" must correspond exactly to the original segment's seconds, converted to hh:mm:ss.
- When creating the chapters, pay special attention to the minimum duration of 2-3 minutes.
- For instance, if a segment shows start: 125 → "00:02:05" and end: 368 → "00:06:08", preserve those exact values, unchanged.
- Values in the "startTime" and "endTime" keys must be in the "hh:mm:ss" format (hours, minutes, seconds) and SHOULD BE BASED ON VALID SEGMENT TIMES. BE SURE THE VALUES ARE NOT ROUNDED OR SHORTENED OR EVEN MISSED OR SKIPPED OR BAD OR INCORRECT. IF IT's SECONDS THEN IT'S SECONDS. IF IT's MINUTES THEN IT's MINUTES. IF IT's HOURS THEN IT's HOURS. 
- BE SURE THAT EVERYTHING HAS CORRECT ASCII, DON'T USE NOT HANDLED CHARACTERS, ONLY GLOSSORY IN ENGLISH, NO OTHER THAN ENGLISH LANGUAGE, NO OTHER NOT ENGLISH LANGUAGE. NOT ANY INVALID CHARACTERS THAT WOULD BREAK THE JSON FORMAT.
Here is the transcription of the recording (segments in seconds):
${JSON.stringify(transcription.segments, null, 2)}

Be sure to fill in all the required elements (summary, key points, chapters, quality assessment, glossary) and answer in ${outputLanguage}.
`;
  
  try {
    const { text: analysisResponse } = await generateText({
      model: groq('llama-3.3-70b-specdec'),
      prompt: prompt,
      temperature: 0.4,
    });
    
    console.log("Received response from model, processing...");
    const parsedResponse = await cleanAndParseAIResponse(analysisResponse);
    if(!parsedResponse) {
      throw new Error("Invalid response from model");
    }
    
    return {
      title,
      summary: parsedResponse.summary || "",
      keyPoints: parsedResponse.keyPoints || [],
      videoChapters: parsedResponse.videoChapters || [],
      presentationQuality: parsedResponse.presentationQuality || {
        overallClarity: "",
        difficultSegments: [],
        improvementSuggestions: []
      },
      glossary: parsedResponse.glossary || {}
    };
  } catch (error) {
    console.error("Error during text analysis:", error);
    
    return {
      title,
      summary: `An error occurred during transcription analysis: ${error instanceof Error ? error.message : String(error)}`,
      keyPoints: [],
      videoChapters: [],
      presentationQuality: {
        overallClarity: "",
        difficultSegments: [],
        improvementSuggestions: []
      },
      glossary: {}
    };
  }
} 