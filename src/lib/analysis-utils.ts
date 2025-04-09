import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export type VideoAnalysisResult = {
  title: string;
  summary: string;
  keyPoints: string[];
  discussionQuestions: string[];
  videoChapters: VideoChapter[];
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
  [key: string]: unknown;
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
  transcriptionText: string, 
  outputLanguage: string = "english"
): Promise<VideoAnalysisResult> {
  console.log("Starting text analysis with Groq model");

  const prompt = `You are an expert in analyzing lectures and podcasts, creating high-quality educational materials.
    
  Below is a transcription of a recording titled "${title}".
  
  Analyze this transcription and prepare:
  
  1. A detailed summary of the content (minimum of 20 paragraphs)
  2. A list of 5-7 most important points and concepts
  3. Chapters of the recording with time ranges - divide the recording into logical thematic sections
  
  You need to return exactly these elements in JSON format and stick with this format and format of the following structure:
  {
    "summary": "Here goes the detailed summary...",
    "keyPoints": ["Point 1", "Point 2", ...],
    "videoChapters": [
      {"startTime": "00:00:00", "endTime": "00:02:30", "title": "Introduction", "description": "Brief description of this section"},
      {"startTime": "00:02:31", "endTime": "00:07:45", "title": "Main Concept", "description": "Description of this chapter's content"},
      {"startTime": "00:07:46", "endTime": "00:12:10", "title": "Practical Example", "description": "Description of the example"}
    ]
  }
  
  Very important: 
  1. Your response must be in ${outputLanguage} language.
  2. Respond ONLY with valid JSON in the exact format specified above.
  3. Do not include any explanations, markdown formatting like triple backticks, or any text outside the JSON structure.
  4. Ensure all JSON strings are properly escaped.
  
  Remember that "videoChapters" should divide the entire recording into logical thematic sections, covering the entire duration, with appropriate time ranges from-to. Use the words from the transcription along with their timestamps to determine chapter boundaries.
  
  Transcription:
  ${transcriptionText}`;
  
  console.log("Sending request to model with prompt length:", prompt.length);
  
  try {
    const { text: analysisResponse } = await generateText({
      model: groq('qwen-qwq-32b'),
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
      videoChapters: parsedResponse.videoChapters || []
    };
  } catch (error) {
    console.error("Error during text analysis:", error);
    
    return {
      title,
      summary: `An error occurred during transcription analysis: ${error instanceof Error ? error.message : String(error)}`,
      keyPoints: [],
      discussionQuestions: [],
      videoChapters: []
    };
  }
} 