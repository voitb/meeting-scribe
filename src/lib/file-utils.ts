import fs from "fs";
import path from "path";
import os from "os";

export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export function generateTempFilePath(prefix: string = "temp", extension: string = ""): string {
  const timestamp = new Date().getTime();
  const randomPart = Math.floor(Math.random() * 10000);
  const fileName = `${prefix}-${timestamp}-${randomPart}${extension ? `.${extension}` : ""}`;
  return path.join(os.tmpdir(), fileName);
}

export function cleanupTempFiles(filePaths: string[], logPrefix: string = ""): void {
  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`${logPrefix}Deleted temporary file: ${filePath}`);
      } catch (e) {
        console.error(`${logPrefix}Error deleting file ${filePath}:`, e);
      }
    }
  }
}

export function validateAudioFile(filePath: string, requiredExtension: string = "mp3"): string {
  if (!fs.existsSync(filePath)) {
    throw new Error("Audio file does not exist");
  }
  
  const fileStats = fs.statSync(filePath);
  if (fileStats.size === 0) {
    throw new Error("Audio file is empty and cannot be processed");
  }
  
  const expectedExtension = `.${requiredExtension.toLowerCase()}`;
  if (!filePath.toLowerCase().endsWith(expectedExtension)) {
    const newPath = `${filePath}${expectedExtension}`;
    fs.renameSync(filePath, newPath);
    filePath = newPath;
    console.log(`Renamed file to: ${filePath}`);
  }
  
  console.log(`Audio file validated: ${filePath} (size: ${fileStats.size} bytes)`);
  return filePath;
}

export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    operationName: string;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
  }
): Promise<T> {
  const {
    maxRetries = 5,
    retryDelay = 2000,
    operationName,
    shouldRetry = () => true
  } = options;
  
  let lastError: unknown = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt #${attempt + 1} of operation ${operationName}`);
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      console.error(`Error during attempt #${attempt + 1} of operation ${operationName}:`, error);
      
      if (attempt < maxRetries - 1 && shouldRetry(error, attempt)) {
        const waitTime = retryDelay;
        console.log(`Waiting ${waitTime}ms before retrying...`);
        await delay(waitTime);
      } else {
        throw new Error(`Failed to perform operation ${operationName} after ${attempt + 1} attempts: ${
          lastError instanceof Error ? lastError.message : String(lastError)
        }`);
      }
    }
  }
  
  throw new Error(`Unexpected error during operation ${operationName}`);
} 