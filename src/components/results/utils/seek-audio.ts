/**
 * Function to seek audio position via event
 * @param seconds Number of seconds to seek to
 */
export function seekAudio(seconds: number): void {
  // Create and emit custom event
  const event = new CustomEvent("seek-audio", { 
    detail: { seconds } 
  });
  window.dispatchEvent(event);
} 