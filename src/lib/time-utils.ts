/**
 * Converts a time range string (e.g. "00:30 - 01:45") to seconds
 * Uses the start time for seeking purposes
 */
export function timeRangeToSeconds(timeRange: string): number {
  const startTime = timeRange.split("-")[0].trim();
  return timeToSeconds(startTime);
}

/**
 * Converts a time string (HH:MM:SS or MM:SS) to seconds
 */
export function timeToSeconds(timeString: string): number {
  const parts = timeString.split(":").map(Number);
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Formats duration between start and end times
 */
export function formatDuration(startTime: string, endTime?: string): string {
  if (!endTime) return "";

  const startSeconds = timeToSeconds(startTime);
  const endSeconds = timeToSeconds(endTime);
  const durationSeconds = endSeconds - startSeconds;

  if (durationSeconds <= 0) return "";

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
} 