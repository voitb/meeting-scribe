/**
 * Deletes a transcription file using the API
 * @param audioId Audio ID for which to delete the transcription
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function deleteTranscriptionFile(audioId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/delete-transcription/${audioId}`, {
      method: "DELETE",
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error deleting transcription:", error);
    return false;
  }
} 