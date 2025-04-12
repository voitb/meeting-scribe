import fs from "fs";
import ytdl, { MoreVideoDetails } from "@distube/ytdl-core";
import Groq from "groq-sdk";
import { withRetry, cleanupTempFiles, validateAudioFile, generateTempFilePath } from "./file-utils";

export function generateRandomParam(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export type ResponseFormat = "verbose_json" | "json" | "text";
export type TimestampGranularity = "word" | "segment";

export async function getVideoInfo(videoURL: string): Promise<ytdl.videoInfo> {

  const responseHeaders = new Headers();

  const randomName = Math.random().toString(36).substring(2, 15);

  responseHeaders.set(
    "Content-Disposition",
    `attachment; filename="${randomName}.mp4"`,
  );

  responseHeaders.set('Content-Type', 'audio/mp4')

  responseHeaders.set(
  "User-Agent",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
);

  responseHeaders.set("Accept-Language", "en-US,en;q=0.9");
  responseHeaders.set("Referer", "https://www.youtube.com/");
  responseHeaders.set("sec-ch-ua", '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"');
  responseHeaders.set("sec-ch-ua-mobile", "?0");
  responseHeaders.set("sec-ch-ua-platform", '"Windows"');

  return withRetry(
    async () => {
      const urlWithParam = `${videoURL}&nocache=${generateRandomParam()}`;
      
      return await ytdl.getBasicInfo(urlWithParam, {
        requestOptions: {
          headers: responseHeaders
        }
      });
    },
    {
      operationName: "fetch video info",
      maxRetries: 10,
      retryDelay: 3000,
    }
  );
}

export async function downloadYouTubeAudio(videoURL: string, tempBasePath: string): Promise<string> {
  const potentialTempFiles: string[] = [];
  
  try {
    return await withRetry(
      async (attempt) => {
        const uniqueFilePath = `${tempBasePath}-${attempt}.mp3`;
        potentialTempFiles.push(uniqueFilePath);
        
        const writeStream = fs.createWriteStream(uniqueFilePath);
        const urlWithParam = `${videoURL}&nocache=${generateRandomParam()}`;
        
        const downloadPromise = new Promise<string>((resolve, reject) => {
          const stream = ytdl(urlWithParam, {
            quality: "highestaudio",
            filter: "audioonly",
            requestOptions: {
              headers: {
                "Cache-Control": "no-cache, no-store",
                "Pragma": "no-cache",
                "Expires": "0",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              }
            }
          });
          
          stream.on("info", info => {
            console.log(`[Attempt #${attempt + 1}] Downloading video: ${info.videoDetails.title}`);
          });
          
          stream.on("progress", (_, downloaded, total) => {
            if (total) {
              const percent = (downloaded / total) * 100;
              console.log(`[Attempt #${attempt + 1}] Downloaded: ${percent.toFixed(2)}%`);
            }
          });
          
          stream.on("error", reject);
          
          stream.pipe(writeStream);
          
          writeStream.on("finish", () => {
            console.log(`[Attempt #${attempt + 1}] Write completed: ${uniqueFilePath}`);
            resolve(uniqueFilePath);
          });
          
          writeStream.on("error", reject);
        });
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Timeout during audio download`));
          }, 60000);
        });
        
        const filePath = await Promise.race([downloadPromise, timeoutPromise]);
        
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
          console.log(`[Attempt #${attempt + 1}] Audio file saved successfully: ${filePath}`);
          
          const filesToCleanup = potentialTempFiles.filter(p => p !== filePath);
          cleanupTempFiles(filesToCleanup);
          
          return filePath;
        } else {
          throw new Error(`Downloaded file is empty or does not exist`);
        }
      },
      {
        operationName: "download audio",
        maxRetries: 10,
        retryDelay: 3000,
      }
    );
  } catch (error) {
    cleanupTempFiles(potentialTempFiles, "Download error: ");
    throw error;
  }
}

export interface GroqTranscriptionWord {
  word: string;
  start: number;
  end: number;
}

export interface GroqTranscriptionSegment {
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

export interface GroqTranscriptionResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  words: GroqTranscriptionWord[];
  segments: GroqTranscriptionSegment[];
  x_groq?: {
    id: string;
  };
}

export async function transcribeAudio(audioFilePath: string, language: string = "auto"): Promise<GroqTranscriptionResponse> {
  const groq = new Groq();
  
  const transcriptionOptions = {
    file: fs.createReadStream(audioFilePath),
    model: "whisper-large-v3-turbo",
    prompt: "Specify context or spelling",
    response_format: "verbose_json" as ResponseFormat,
    timestamp_granularities: ["word", "segment"] as TimestampGranularity[],
    language: language !== "auto" ? language : undefined,
  };
  
  return await groq.audio.transcriptions.create(transcriptionOptions) as GroqTranscriptionResponse;
}

export async function fetchAudioFromYouTube(videoURL: string, language: string = "auto"): Promise<{
  videoDetails: MoreVideoDetails;
  transcription: unknown;
}> {
  const tempBasePath = generateTempFilePath("youtube-audio");
  let tempFilePath: string | null = null;
  
  try {
    const videoInfo = await getVideoInfo(videoURL);
    const {videoDetails} = videoInfo;

    if(+videoDetails.lengthSeconds > (60 * 5)) {
      throw new Error("Video is too long");
    }
    
    
    tempFilePath = await downloadYouTubeAudio(videoURL, tempBasePath);
    console.log("Audio download completed successfully, file:", tempFilePath);
    
    tempFilePath = validateAudioFile(tempFilePath);
    
    console.log("Starting audio transcription...");
    const transcriptionResult = await transcribeAudio(tempFilePath, language);
    console.log("Transcription completed successfully!");
    
    const transcription = { ...transcriptionResult };
    if (transcription.segments && Array.isArray(transcription.segments)) {
      transcription.segments = transcription.segments.map(segment => ({
        ...segment,
        start: Math.floor(segment.start),
        end: Math.floor(segment.end)
      }));
    }

    cleanupTempFiles([tempFilePath]);
    
    return { 
      videoDetails,
      transcription 
    };
  } catch (error) {
    console.error("Error during audio download/transcription:", error);
    
    if (tempFilePath) {
      cleanupTempFiles([tempFilePath]);
    }
    
    const potentialTempFiles = Array.from({ length: 10 }, (_, i) => `${tempBasePath}-${i}.mp3`);
    cleanupTempFiles(potentialTempFiles);
    
    throw error;
  }
} 