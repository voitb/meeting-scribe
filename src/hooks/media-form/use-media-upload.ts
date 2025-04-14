"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface MediaFileValidationOptions {
  maxAudioSize?: number;
  maxVideoSize?: number;
}

interface UseMediaUploadOptions {
  validationOptions?: MediaFileValidationOptions;
}

interface UseMediaUploadReturn {
  mediaFile: File | null;
  isVideoFile: boolean;
  isLoading: boolean;
  error: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}


export function useMediaUpload({
  validationOptions = {
    maxAudioSize: 10 * 1024 * 1024, 
    maxVideoSize: 25 * 1024 * 1024, 
  },
}: UseMediaUploadOptions = {}): UseMediaUploadReturn {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [language] = useState("english");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVideoFile, setIsVideoFile] = useState(false);
  const router = useRouter();

  // Check if user is authenticated
  const { isAuthenticated } = useConvexAuth();

  // Mutation for saving audio
  const addAudioAnalysis = useMutation(api.audio.addAudioAnalysis);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Define allowed formats for audio and video
      const validAudioTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp3",
        "audio/ogg",
        "audio/x-m4a",
        "audio/webm",
      ];

      const validVideoTypes = [
        "video/mp4",
        "video/x-matroska",
        "video/webm",
        "video/quicktime",
      ];

      const isAudio = validAudioTypes.includes(file.type);
      const isVideo = validVideoTypes.includes(file.type);

      // Check if format is allowed
      if (!isAudio && !isVideo) {
        setError(
          "Invalid file format. Supported formats: MP3, WAV, OGG, M4A, WEBM, MP4"
        );
        setMediaFile(null);
        return;
      }

      // Set video flag
      setIsVideoFile(isVideo);

      // File size limit - 10MB for audio, 25MB for video
      const { maxAudioSize, maxVideoSize } = validationOptions;
      const maxSize = isVideo ? maxVideoSize : maxAudioSize;

      if (file.size > maxSize!) {
        setError(
          `File is too large. Maximum size is ${
            isVideo ? "25MB" : "10MB"
          }`
        );
        setMediaFile(null);
        return;
      }

      setMediaFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mediaFile) {
      setError("Please select an audio or video file");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("mediaFile", mediaFile);
      formData.append("language", language);
      formData.append("isVideo", isVideoFile.toString());

      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.warning(
          "You are not logged in. Your analysis will not be saved to your account."
        );
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error processing media");
      }

      const transcriptionData = await response.json();
      const audioId = transcriptionData.audioId || Date.now().toString();

      // If user is authenticated, save analysis directly to Convex database
      if (isAuthenticated) {
        try {
          console.log("Saving analysis to user account...");

          // Save basic data to Convex database
          const audioDetails = transcriptionData.audioDetails || {};
          const title = audioDetails.title || "Untitled Recording";

          await addAudioAnalysis({
            url: audioId,
            title: title,
            summary: "Processing...",
            keyPoints: ["Processing..."],
            meetingOutcomes: [],
            audioChapters: [],
            presentationQuality: {
              overallClarity: "",
              difficultSegments: [],
              improvementSuggestions: [],
            },
            glossary: {},
            analysisDate: new Date().toISOString(),
          });

          console.log("Analysis saved successfully!");
        } catch (saveError) {
          console.error("Error saving analysis to database:", saveError);
          // Continue even if saving to database fails
          toast.error(
            "Could not save analysis to your account, but processing continues."
          );
        }
      }

      router.push(`/result/${audioId}`);
    } catch (err) {
      setError("Failed to process file. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mediaFile,
    isVideoFile,
    isLoading,
    error,
    handleFileChange,
    handleSubmit,
  };
} 