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
  
  Analyze this transcription and prepare:
  
  1. A detailed summary of the content (minimum of 20 paragraphs)
  2. A list of 5-7 most important points and concepts
  3. Chapters of the recording with time ranges - divide the recording into logical thematic sections
  4. Assessment of presentation quality - evaluate clarity, identify difficult segments, suggest improvements
  5. Glossary of key terms - create a dictionary of important concepts with their definitions
  
  You need to return exactly these elements in JSON format with the following structure:
  {
    "summary": "Here goes the detailed summary...",
    "keyPoints": ["Point 1", "Point 2", ...],
    "videoChapters": [
      {"startTime": "00:00:00", "endTime": "00:02:30", "title": "Introduction", "description": "Brief description of this section"},
      {"startTime": "00:02:31", "endTime": "00:07:45", "title": "Main Concept", "description": "Description of this chapter's content"},
      {"startTime": "00:07:46", "endTime": "00:12:10", "title": "Practical Example", "description": "Description of the example"},
      ...
    ],
    "presentationQuality": {
      "overallClarity": "Overall assessment of the speaker's clarity and effectiveness",
      "difficultSegments": [
        {"timeRange": "00:05:22-00:06:45", "issue": "Technical jargon without explanation", "improvement": "Could add brief definitions"},
        {"timeRange": "00:12:30-00:13:20", "issue": "Unclear explanation", "improvement": "Simplify and provide an example"}
      ],
      "improvementSuggestions": ["Suggestion 1", "Suggestion 2", ...]
    },
    "glossary": {
      "Term 1": "Definition of term 1 as explained in the transcript at [timestamp]",
      "Term 2": "Definition of term 2 as explained in the transcript at [timestamp]",
      ...
    }
  }
  
  Very important: 
  1. Your response must be in ${outputLanguage} language.
  2. Respond ONLY with valid JSON in the exact format specified above.
  3. Do not include any explanations, markdown formatting like triple backticks, or any text outside the JSON structure.
  4. Ensure all JSON strings are properly escaped.
  
  You need to consider the following:
  In the transcription, I'm providing an array of segments where each segment contains:
  -"start": the time the segment starts, in seconds
  -"end": the time the segment ends, in seconds
  -"text": the text spoken in that segment

  CRITICAL INSTRUCTIONS FOR VIDEO CHAPTERS:
  - Create substantial, meaningful chapters that represent major topic changes (typically 3-10 minutes long, depending on content)
  - DO NOT create tiny chapters (e.g., 2-3 seconds) or excessively short chapters
  - Each chapter must cover a complete thought or topic
  - Ensure chapters are contiguous and cover the entire video duration (no gaps or overlaps)
  - Use transcript content and timestamps to accurately determine logical topic transitions
  - Chapter titles should clearly indicate the main topic/theme of that section
  
  "glossary": Extract only terms that are explicitly mentioned and defined in the transcript. Include the exact definitions as presented in the content, with timestamps where possible. Do not invent definitions not present in the source material. Make sure you only extract terms that are hard to understand not something easy like "break" or "pause".

  Transcription (segments):
  ${JSON.stringify(transcription.segments, null, 2)}
  
  REMEMBER to return the response with ALL fields in the exact JSON format specified:
  {
    "summary": "...",
    "keyPoints": ["...", "..."],
    "videoChapters": [{"startTime": "...", "endTime": "...", "title": "...", "description": "..."}, ...],
    "presentationQuality": {"overallClarity": "...", "difficultSegments": [...], "improvementSuggestions": [...]},
    "glossary": {"Term 1": "Definition 1", "Term 2": "Definition 2", ...}
  }
  `;
  
  console.log("Prompt:", prompt);
  
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

    console.log("Processed response structure:", Object.keys(parsedResponse));
    
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