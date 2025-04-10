"use client";

import { Clock } from "lucide-react";

export interface VideoChapter {
  startTime: string; // Format: "00:00:00"
  endTime?: string; // Format: "00:00:00" (might be "endtime" in some data)
  endtime?: string; // Alternative field name
  title: string;
  description: string;
}

interface VideoChaptersProps {
  chapters: VideoChapter[];
  onChapterClick: (seconds: number) => void;
}

export function VideoChapters({
  chapters,
  onChapterClick,
}: VideoChaptersProps) {
  // Convert HH:MM:SS to seconds for internal use
  const timeToSeconds = (timeString: string): number => {
    const parts = timeString.split(":").map(Number);
    if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  // Format duration between start and end times
  const formatDuration = (startTime: string, endTime?: string): string => {
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
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-foreground">
        Video Chapters
      </h3>
      <div className="space-y-3">
        {chapters.map((chapter, index) => {
          const endTime = chapter.endTime || chapter.endtime;
          const duration = endTime
            ? formatDuration(chapter.startTime, endTime)
            : "";

          return (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => onChapterClick(timeToSeconds(chapter.startTime))}
                className="w-full flex items-center p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="bg-accent/10 rounded-full h-10 w-10 flex items-center justify-center mr-4 flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">
                      {chapter.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {duration && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                          {duration}
                        </span>
                      )}
                      <span className="text-sm font-mono text-muted-foreground">
                        {chapter.startTime}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {chapter.description}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
