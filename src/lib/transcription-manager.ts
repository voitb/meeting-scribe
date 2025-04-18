'use server';

import fs from 'fs';
import path from 'path';

// Stała określająca czas wygaśnięcia transkrypcji w milisekundach (1 godzina)
const TRANSCRIPTION_EXPIRATION_MS = 60 * 60 * 1000;

// Directory for storing transcriptions - now as private constant
const TRANSCRIPTIONS_DIR_PATH = path.join(process.cwd(), "transcriptions");

// Function to get transcriptions directory path
export async function getTranscriptionsDir(): Promise<string> {
  'use server';
  return TRANSCRIPTIONS_DIR_PATH;
}

// Ensure transcriptions directory exists
export async function ensureTranscriptionsDir(): Promise<void> {
  'use server';
  
  const dir = await getTranscriptionsDir();
  try {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Ensured transcriptions directory exists: ${dir}`);
  } catch (error) {
    console.error(`Error creating transcriptions directory (${dir}):`, error);
  }
}

/**
 * Gets all transcription files from the transcriptions directory
 */
export async function getTranscriptionFiles(): Promise<string[]> {
  'use server';
  
  await ensureTranscriptionsDir();
  const dir = await getTranscriptionsDir();
  
  try {
    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(dir, file));
    
    return files;
  } catch (error) {
    console.error('Error reading transcription files:', error);
    return [];
  }
}

/**
 * Cleans up transcription files that are older than the specified maximum age
 * @param maxAgeHours Maximum age of files to keep (in hours)
 * @returns Information about the cleanup
 */
export async function cleanupOldTranscriptions(maxAgeHours: number = 24): Promise<{ 
  deleted: number; 
  failed: number;
  keptCount: number;
  totalSize: number;
  deletedSize: number;
}> {
  'use server';
  
  const files = await getTranscriptionFiles();
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  
  let deleted = 0;
  let failed = 0;
  let keptCount = 0;
  let totalSize = 0;
  let deletedSize = 0;
  
  for (const filePath of files) {
    try {
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      const fileAge = now - stats.mtimeMs;
      
      if (fileAge > maxAgeMs) {
        const fileSize = stats.size;
        try {
          fs.unlinkSync(filePath);
          deleted++;
          deletedSize += fileSize;
          console.log(`Deleted old transcription file: ${filePath} (${fileSize} bytes)`);
        } catch (e) {
          failed++;
          console.error(`Error deleting transcription file ${filePath}:`, e);
        }
      } else {
        keptCount++;
      }
    } catch (e) {
      console.error(`Error processing transcription file ${filePath}:`, e);
    }
  }
  
  console.log(`Transcription cleanup completed: ${deleted} files deleted, ${failed} failed, ${keptCount} kept`);
  console.log(`Total size of transcriptions: ${formatBytes(totalSize)}, Freed: ${formatBytes(deletedSize)}`);
  
  return { 
    deleted, 
    failed,
    keptCount,
    totalSize,
    deletedSize
  };
}

/**
 * Deletes a specific transcription file by ID
 * @param audioId The audio ID for the transcription file
 * @returns Whether the deletion was successful
 */
export async function deleteTranscription(audioId: string): Promise<boolean> {
  'use server';
  
  if (!audioId) return false;
  
  const dir = await getTranscriptionsDir();
  const filePath = path.join(dir, `${audioId}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted transcription file: ${filePath}`);
      return true;
    } else {
      console.log(`Transcription file not found: ${filePath}`);
      return false;
    }
  } catch (e) {
    console.error(`Error deleting transcription file ${filePath}:`, e);
    return false;
  }
}

/**
 * Gets information about transcription files
 */
export async function getTranscriptionStats() {
  'use server';
  
  const files = await getTranscriptionFiles();
  let totalSize = 0;
  let oldestTimestamp: number | null = null;
  let newestTimestamp: number | null = null;
  let oldestFile: string | null = null;
  let newestFile: string | null = null;
  
  for (const filePath of files) {
    try {
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      const mtimeMs = stats.mtimeMs;
      const fileName = path.basename(filePath);
      
      if (oldestTimestamp === null || mtimeMs < oldestTimestamp) {
        oldestTimestamp = mtimeMs;
        oldestFile = fileName;
      }
      
      if (newestTimestamp === null || mtimeMs > newestTimestamp) {
        newestTimestamp = mtimeMs;
        newestFile = fileName;
      }
    } catch (e) {
      console.error(`Error getting stats for file ${filePath}:`, e);
    }
  }
  
  return {
    count: files.length,
    totalSize,
    oldestFile,
    newestFile,
    oldestTimestamp,
    newestTimestamp
  };
}

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Dodaje metadane wygaśnięcia do pliku transkrypcji
 * @param transcriptionPath Ścieżka do pliku transkrypcji
 * @param expirationMs Czas wygaśnięcia w milisekundach od teraz (domyślnie 1 godzina)
 */
export async function setTranscriptionExpiration(
  transcriptionPath: string, 
  expirationMs: number = TRANSCRIPTION_EXPIRATION_MS
): Promise<void> {
  'use server';
  
  try {
    if (!fs.existsSync(transcriptionPath)) {
      console.error(`Plik transkrypcji nie istnieje: ${transcriptionPath}`);
      return;
    }
    
    // Oblicz czas wygaśnięcia (teraz + określony czas)
    const expirationTime = Date.now() + expirationMs;
    
    // Odczytaj istniejący plik JSON
    const transcriptionContent = JSON.parse(fs.readFileSync(transcriptionPath, 'utf8'));
    
    // Dodaj lub zaktualizuj pole wygaśnięcia
    transcriptionContent.metadata = {
      ...transcriptionContent.metadata,
      expirationTime
    };
    
    // Zapisz zaktualizowaną zawartość
    fs.writeFileSync(transcriptionPath, JSON.stringify(transcriptionContent, null, 2));
    
    console.log(`Ustawiono czas wygaśnięcia dla ${transcriptionPath}: ${new Date(expirationTime).toISOString()}`);
  } catch (error) {
    console.error(`Błąd podczas ustawiania czasu wygaśnięcia dla ${transcriptionPath}:`, error);
  }
}

/**
 * Czyści przeterminowane pliki transkrypcji
 * @returns Informacje o czyszczeniu
 */
export async function cleanupExpiredTranscriptions(): Promise<{ 
  deleted: number; 
  failed: number;
  keptCount: number;
}> {
  'use server';
  
  const files = await getTranscriptionFiles();
  const now = Date.now();
  
  let deleted = 0;
  let failed = 0;
  let keptCount = 0;
  
  for (const filePath of files) {
    try {
      // Odczytaj plik transkrypcji
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Sprawdź, czy plik ma metadane wygaśnięcia
      const expirationTime = content.metadata?.expirationTime;
      
      if (expirationTime && expirationTime < now) {
        // Plik wygasł - usuń go
        try {
          fs.unlinkSync(filePath);
          deleted++;
          console.log(`Usunięto wygasły plik transkrypcji: ${filePath}`);
        } catch (e) {
          failed++;
          console.error(`Błąd podczas usuwania pliku transkrypcji ${filePath}:`, e);
        }
      } else {
        keptCount++;
      }
    } catch (e) {
      console.error(`Błąd podczas przetwarzania pliku transkrypcji ${filePath}:`, e);
    }
  }
  
  console.log(`Czyszczenie zakończone: usunięto ${deleted} plików, ${failed} błędów, pozostawiono ${keptCount}`);
  
  return { 
    deleted, 
    failed,
    keptCount
  };
} 