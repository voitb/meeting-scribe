import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai'; 

export type VideoAnalysisResult = {
  title: string;
  summary: string;
  keyPoints: string[];
  discussionQuestions: string[];
  videoChapters: VideoChapter[];
  presentationQuality: {
    overallClarity: string;
    difficultSegments: {
      timeRange: string;
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
      timeRange: string;
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

  const prompt = `You are an expert in analyzing lectures and podcasts, creating high-quality educational materials.

  Below is a transcription of a recording titled "${title}".

  IMPORTANT - CRUCIAL INFORMATION ABOUT TIME FORMAT:
  - In the transcription, times are given in SECONDS.
  - In your response, times must be in the "hh:mm:ss" format.
  - Every numeric value in the "start" and "end" fields represents seconds. You must convert them into hours, minutes, and seconds in the "hh:mm:ss" format.
  - Conversion examples:
    - 90 seconds = "00:01:30" (not "00:90:00")
    - 3661 seconds = "01:01:01"

  Your task is to:

  1. Provide a detailed summary of the recording (at least 30 sentences, at most 50 sentences).
  2. List 5-7 most important points and concepts.
  3. Divide the recording into MEANINGFUL CHAPTERS (5-10 chapters maximum) with time ranges in "hh:mm:ss" format, a title, and a short description. Each chapter MUST cover substantial content (at least several minutes in length). They must fully cover the material from "00:00:00" to the end without gaps between chapters.
  4. Assess the presentation quality:
    - How would you rate the clarity of the content?
    - Identify up to 5 difficult segments (with time ranges "hh:mm:ss-hh:mm:ss") and propose how they could be improved.
    - Provide general suggestions for improving presentation quality.
  5. Create a glossary of key terms - list more complex concepts that were actually defined in the transcript. Include the approximate time (in "hh:mm:ss" format) of where the definition appears in the recording, along with a brief explanation.

  CRITICAL INSTRUCTIONS FOR VIDEO CHAPTERS - READ CAREFULLY:
  - Each chapter MUST be AT LEAST 2-3 MINUTES LONG, preferably longer (5-15 minutes) for substantive topics.
  - NEVER create chapters shorter than 2 minutes - these are TOO SHORT to be useful.
  - Chapters should represent MAJOR THEMATIC SECTIONS where the speaker discusses a cohesive topic or concept.
  - Focus on creating meaningful, substantive chapters that give viewers clear navigation points.
  - The goal is to create a helpful outline of the content, not timestamp every small statement.
  - If the content is short, create fewer chapters but ensure each covers a complete thought or topic.
  - Each chapter should have a descriptive title and a concise summary in ${outputLanguage}.
  - The start and end times of each chapter must be converted from seconds to "hh:mm:ss."

  GLOSSARY:
  - List ONLY the terms that are actually defined or explained in detail within the recording.
  - Do not add definitions not found in the source material.
  - Example: "Term 1": "Definition of term 1 mentioned around [timestamp]".

  Finally, return your answer in exactly this JSON structure (with no additional descriptions, comments, tags, or text outside the JSON). Make sure everything is properly nested and there are no extra characters. Here is the template:

  {
    "summary": "Insert your detailed summary here...",
    "keyPoints": ["Point 1", "Point 2", ...],
    "videoChapters": [
      {
        "startTime": "hh:mm:ss",
        "endTime": "hh:mm:ss",
        "title": "Chapter Title",
        "description": "Brief description of the chapter"
      },
      ...
    ],
    "presentationQuality": {
      "overallClarity": "Overall assessment of clarity and effectiveness",
      "difficultSegments": [
        {
          "timeRange": "hh:mm:ss-hh:mm:ss",
          "issue": "Issue description, e.g., technical jargon without explanation",
          "improvement": "Suggested improvement"
        },
        ...
      ],
      "improvementSuggestions": ["Suggestion 1", "Suggestion 2", ...]
    },
    "glossary": {
      "Term 1": "Definition of term 1 along with approximate timestamp...",
      "Term 2": "Definition of term 2 along with approximate timestamp..."
    }
  }

  Transcription (segments):
  \`\`\`
  ${JSON.stringify(transcription.segments, null, 2)}
  \`\`\`

  Remember:
  1. Your answer must be in the ${outputLanguage} language.
  2. Respond only with valid JSON in the specified format (no additional explanations, comments, or markers).
  3. Ensure all times given in seconds are correctly converted to the "hh:mm:ss" format.
  4. MOST IMPORTANT: Create SUBSTANTIVE CHAPTERS (at least several minutes long each) that properly segment the content. SHORT CHAPTERS (seconds or 1 minute) ARE NOT ACCEPTABLE.
  `;
  
  try {
    const { text: analysisResponse } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
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
      discussionQuestions: parsedResponse.discussionQuestions || [],
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
      discussionQuestions: [],
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