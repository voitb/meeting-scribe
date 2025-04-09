import fs from "fs";
import ytdl from "@distube/ytdl-core";
import Groq from "groq-sdk";
import { withRetry, cleanupTempFiles, validateAudioFile, generateTempFilePath } from "./file-utils";

export function generateRandomParam(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export type ResponseFormat = "verbose_json" | "json" | "text";
export type TimestampGranularity = "word" | "segment";

export async function getVideoInfo(videoURL: string): Promise<ytdl.videoInfo> {
  return withRetry(
    async () => {
      const urlWithParam = `${videoURL}&nocache=${generateRandomParam()}`;
      
      return await ytdl.getBasicInfo(urlWithParam, {
        requestOptions: {
          headers: {
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache",
            "Expires": "0",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
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

export async function transcribeAudio(audioFilePath: string, language: string = "auto"): Promise<unknown> {
  const groq = new Groq();
  
  const transcriptionOptions = {
    file: fs.createReadStream(audioFilePath),
    model: "whisper-large-v3-turbo",
    prompt: "Specify context or spelling",
    response_format: "verbose_json" as ResponseFormat,
    timestamp_granularities: ["word", "segment"] as TimestampGranularity[],
    language: language !== "auto" ? language : undefined,
  };
  
  console.log("Transcription options:", JSON.stringify(transcriptionOptions, (key, value) => {
    if (key === 'file') return audioFilePath;
    return value;
  }));
  
  return await groq.audio.transcriptions.create(transcriptionOptions);
}

export async function fetchAudioFromYouTube(videoURL: string, language: string = "auto"): Promise<{
  title: string;
  transcription: unknown;
}> {
  console.log("Starting audio download and analysis process for:", videoURL);
  console.log("Transcription language:", language);
  
  const tempBasePath = generateTempFilePath("youtube-audio");
  let tempFilePath: string | null = null;
  
  try {
    const videoInfo = await getVideoInfo(videoURL);
    const videoTitle = videoInfo.videoDetails.title;
    console.log("Video title:", videoTitle);
    
    tempFilePath = await downloadYouTubeAudio(videoURL, tempBasePath);
    console.log("Audio download completed successfully, file:", tempFilePath);
    
    tempFilePath = validateAudioFile(tempFilePath);
    
    console.log("Starting audio transcription...");
    const transcription = await transcribeAudio(tempFilePath, language);
    console.log("Transcription completed successfully!");
    
    cleanupTempFiles([tempFilePath]);
    
    return { 
      title: videoTitle,
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