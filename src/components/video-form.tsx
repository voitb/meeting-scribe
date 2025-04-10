"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Youtube } from "lucide-react";
import { extractVideoId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VideoForm() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("english");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!url.includes("youtube.com/") && !url.includes("youtu.be/")) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const videoId = await extractVideoId(url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      router.push(`/result/${videoId}?lang=${language}`);
    } catch (err) {
      setError("Failed to process video. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border shadow-md">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="youtube-url"
              className="block text-base font-medium text-foreground"
            >
              Enter YouTube Video URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Youtube className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="youtube-url"
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>

              <Select
                value={language}
                onValueChange={setLanguage}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="polish">Polish (Polski)</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="german">German (Deutsch)</SelectItem>
                  <SelectItem value="french">French (Français)</SelectItem>
                  <SelectItem value="spanish">Spanish (Español)</SelectItem>
                  <SelectItem value="italian">Italian (Italiano)</SelectItem>
                </SelectContent>
              </Select>

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
            </div>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Processing usually takes 1-3 minutes depending on video length
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
