"use client";

import { VideoChapters } from "@/components/video-chapters";
import type { VideoChapter } from "@/components/video-chapters";

interface ChaptersTabProps {
  chapters: VideoChapter[];
}

export function ChaptersTab({ chapters }: ChaptersTabProps) {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
        <p>No chapters found for this recording.</p>
      </div>
    );
  }

  return <VideoChapters chapters={chapters} />;
}
