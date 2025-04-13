"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Upload,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useConvexAuth } from "convex/react";
import { toast } from "sonner";

export default function AudioPlayer({ audioId }: { audioId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioTitle, setAudioTitle] = useState("Audio recording");
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if user is authenticated (for audio upload/storage)
  const { isAuthenticated } = useConvexAuth();

  // Try to see if we have audio stored in the database
  const storedAudio = useQuery(api.audio.getAudioBlob, { audioId });

  // Get direct Convex mutation for storing audio
  const storeAudioBlob = useMutation(api.audio.storeAudioBlob);

  // Log stored audio details
  useEffect(() => {
    console.log(
      "AudioPlayer - storedAudio query result:",
      storedAudio
        ? {
            hasBlob: !!storedAudio.audioBlob,
            fileName: storedAudio.fileName,
            size: storedAudio.size,
            duration: storedAudio.duration,
          }
        : "not found"
    );
  }, [storedAudio]);

  // URL for the audio source - either from API, transcription or sample
  const audioUrl = storedAudio?.audioBlob
    ? `/api/get-audio/${audioId}`
    : `/api/get-transcription/${audioId}/audio`;

  // Flag to show if audio is stored in the database
  const isAudioStored = !!storedAudio?.audioBlob;

  // Track loading state
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`Audio player initialized for ID: ${audioId}`);
    console.log(`Audio stored in database: ${isAudioStored}`);
    console.log(`Using audio URL: ${audioUrl}`);

    // Reset error state when audioUrl changes
    setAudioError(null);

    // Set up listener for seek-video events
    const handleSeekEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ seconds: number }>;
      const seconds = customEvent.detail?.seconds;

      if (audioRef.current && !isNaN(seconds)) {
        audioRef.current.currentTime = seconds;
        if (!isPlaying) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    };

    window.addEventListener("seek-video", handleSeekEvent);

    // Set audio title based on stored filename or fetch from metadata endpoint
    const fetchAudioMetadata = async () => {
      if (storedAudio?.fileName) {
        // Get filename without extension
        const fileName = storedAudio.fileName;
        const nameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
        setAudioTitle(nameWithoutExtension || fileName);
        setIsAudioLoading(false);
      } else {
        // Try to fetch from metadata API
        try {
          const response = await fetch(`/api/get-audio-metadata/${audioId}`);
          if (response.ok) {
            const metadata = await response.json();
            if (metadata.originalFileName) {
              const fileName = metadata.originalFileName;
              const nameWithoutExtension = fileName
                .split(".")
                .slice(0, -1)
                .join(".");
              setAudioTitle(nameWithoutExtension || fileName);
              setIsAudioLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Could not fetch audio metadata", err);
        }
        // Fallback to generic title
        setAudioTitle(`Audio recording ${audioId.substring(0, 6)}`);
        setIsAudioLoading(false);
      }
    };

    fetchAudioMetadata();

    return () => {
      window.removeEventListener("seek-video", handleSeekEvent);
    };
  }, [audioId, isPlaying, storedAudio]);

  // Add a new useEffect to handle and log audio errors
  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const handleError = (e: Event) => {
        console.error("Audio playback error:", e);

        // Attempt to get more detailed error information
        const mediaError = audioElement.error;
        if (mediaError) {
          console.error("Media error code:", mediaError.code);
          console.error("Media error message:", mediaError.message);

          let errorMessage = "Unknown error playing audio.";
          switch (mediaError.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = "Playback aborted by the user.";
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Network error while loading audio.";
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "Error decoding audio file.";
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Audio format not supported by your browser.";
              break;
          }

          setAudioError(errorMessage);
        }

        toast.error("Error playing audio. Please try again later.");
        // Reset loading state
        setIsAudioLoading(false);
      };

      const handleCanPlay = () => {
        console.log("Audio can play event triggered");
        setIsAudioLoading(false);
        setAudioError(null);
      };

      audioElement.addEventListener("error", handleError);
      audioElement.addEventListener("canplay", handleCanPlay);

      return () => {
        audioElement.removeEventListener("error", handleError);
        audioElement.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [audioUrl]); // Re-run when audioUrl changes

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime - 10
      );
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 10
      );
    }
  };

  // Function to upload the audio file to the database
  const uploadAudioToDB = async () => {
    // Only proceed if authenticated and audio file is available
    if (!isAuthenticated || !audioRef.current?.src) {
      toast.error("You must be logged in to save audio");
      return;
    }

    try {
      setIsUploading(true);
      console.log("Starting audio upload process");
      console.log(`Audio source: ${audioRef.current.src}`);

      // Fetch the audio file
      console.log("Fetching audio file from source...");
      const response = await fetch(audioRef.current.src);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audio: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log(`Retrieved audio blob of size: ${blob.size} bytes`);
      console.log(`Blob type: ${blob.type}`);

      // Get the original filename from URL or use a default with audioId
      let originalFileName;

      if (storedAudio?.fileName) {
        // If we already have filename info from the database, use it
        originalFileName = storedAudio.fileName;
      } else {
        // Try to extract from URL, fallback to generating a name with timestamp
        const urlParts = audioRef.current.src.split("/");
        const lastPart = urlParts[urlParts.length - 1];

        if (lastPart && !lastPart.includes("sample-audio")) {
          originalFileName = decodeURIComponent(lastPart);
        } else {
          // Generate a filename with timestamp if we can't determine it
          originalFileName = `recording-${audioId}-${new Date().toISOString().replace(/[:.]/g, "-")}.mp3`;
        }
      }

      console.log(`Using filename: ${originalFileName}`);

      // Try TWO approaches for storing the blob:

      // APPROACH 1: Direct Convex mutation (preferred)
      try {
        console.log("Trying direct Convex mutation for storing audio...");
        // Convert blob to ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer();

        // Estimate audio duration
        const estimatedDuration = blob.size / ((128 * 1024) / 8); // rough estimate based on ~128kbps bitrate

        // Store directly in Convex
        const directResult = await storeAudioBlob({
          audioId,
          audioBlob: arrayBuffer,
          fileName: originalFileName,
          duration: estimatedDuration / 1000, // convert ms to seconds
          fileSize: blob.size,
        });

        console.log("Direct Convex mutation result:", directResult);
        toast.success("Audio saved to your account with direct method!");

        // Update audio title
        if (originalFileName) {
          const nameWithoutExtension = originalFileName
            .split(".")
            .slice(0, -1)
            .join(".");
          if (nameWithoutExtension) {
            setAudioTitle(nameWithoutExtension);
          }
        }

        // Force refresh
        setTimeout(() => {
          window.location.reload();
        }, 1000);

        return; // Skip approach 2 if approach 1 succeeded
      } catch (directError) {
        console.error("Direct Convex mutation failed:", directError);
        console.log("Falling back to API endpoint method...");
      }

      // APPROACH 2: API endpoint (fallback)
      // Create form data with original filename
      const formData = new FormData();
      formData.append("audioFile", blob, originalFileName);
      formData.append("audioId", audioId);

      // Send to API
      console.log("Sending audio to /api/store-audio endpoint...");
      const uploadResponse = await fetch("/api/store-audio", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload audio");
      }

      const result = await uploadResponse.json();
      console.log("Upload response:", result);

      // Update audio title with the filename (without extension)
      if (originalFileName) {
        const nameWithoutExtension = originalFileName
          .split(".")
          .slice(0, -1)
          .join(".");
        if (nameWithoutExtension) {
          setAudioTitle(nameWithoutExtension);
        }
      }

      toast.success("Audio saved to your account!");

      // Force refresh the query to reflect changes
      setTimeout(() => {
        console.log("Refreshing stored audio query...");
        // This will trigger a re-query of the audio blob from Convex
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save audio"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-4 my-4 bg-card">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
        className="hidden"
      />

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-medium">{audioTitle}</div>

          {/* Display audio source for debugging */}
          <div className="text-xs text-muted-foreground">
            {isAudioStored ? "Using stored audio" : "Using fallback audio"}
          </div>

          {isAuthenticated && !isAudioStored && (
            <Button
              variant="outline"
              size="sm"
              onClick={uploadAudioToDB}
              disabled={isUploading}
              className="text-xs flex items-center gap-1"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full mr-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3 mr-1" />
                  Save to Account
                </>
              )}
            </Button>
          )}

          {isAudioStored && (
            <div className="flex items-center text-xs text-green-500 gap-1">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={skipBackward}
            className="h-9 w-9"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="h-12 w-12 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={skipForward}
            className="h-9 w-9"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm w-12">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4" />
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>

        {isAudioLoading && (
          <div className="flex justify-center items-center py-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
            <span className="text-xs text-muted-foreground">
              Loading audio...
            </span>
          </div>
        )}

        {audioError && (
          <div className="flex justify-center items-center py-2 text-red-500">
            <span className="text-xs text-muted-foreground">{audioError}</span>
          </div>
        )}

        {isAuthenticated && (
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Audio files under 25MB can be saved to your account for future
            playback.
          </div>
        )}
      </div>
    </Card>
  );
}
