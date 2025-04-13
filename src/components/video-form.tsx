"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Music } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { motion } from "framer-motion";
import { AnimatedFormWrapper } from "./animated-form-wrapper";

export default function AudioForm() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [
    language,
    // , setLanguage
  ] = useState("english");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      setError("Please select an audio file");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("audioFile", audioFile);
      formData.append("language", language);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error processing audio");
      }

      const transcriptionData = await response.json();
      const audioId = transcriptionData.audioId || Date.now().toString();

      router.push(`/result/${audioId}`);
    } catch (err) {
      setError("Failed to process the audio file. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validAudioTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp3",
        "audio/ogg",
        "audio/x-m4a",
        "audio/webm",
      ];

      if (!validAudioTypes.includes(file.type)) {
        setError(
          "Invalid file format. Supported formats: MP3, WAV, OGG, M4A, WEBM"
        );
        setAudioFile(null);
        return;
      }

      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError("File is too large. Maximum size is 10MB");
        setAudioFile(null);
        return;
      }

      setAudioFile(file);
      setError("");
    }
  };

  return (
    <AnimatedFormWrapper>
      <Card className="border shadow-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <motion.label
                  htmlFor="audio-file"
                  className="block text-base font-medium text-foreground"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Select an audio file to analyze
                </motion.label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div
                    className="relative flex-grow"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Music className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="audio-file"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        "Generate Materials"
                      )}
                    </Button>
                  </motion.div>
                </div>
                {error && (
                  <motion.p
                    className="text-sm text-destructive mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <motion.div
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <p>
                  Processing typically takes 1-3 minutes depending on the
                  recording length
                </p>
                <p className="mt-2 text-xs flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full mr-2">
                    Note
                  </span>
                  Max file size is 25 MB access
                </p>
              </motion.div>
            </form>
          </CardContent>
        </motion.div>
      </Card>
    </AnimatedFormWrapper>
  );
}
