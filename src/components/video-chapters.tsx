"use client";

import { Clock } from "lucide-react";
import { formatDuration } from "@/lib/time-utils";

export interface VideoChapter {
  startTime: string;
  endTime?: string;
  title: string;
  description: string;
}

interface VideoChaptersProps {
  chapters: VideoChapter[];
}

export function VideoChapters({ chapters }: VideoChaptersProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-foreground">
        Video Chapters
      </h3>
      <div className="space-y-3">
        {chapters.map((chapter, index) => (
          <ChapterItem key={index} chapter={chapter} />
        ))}
      </div>
    </div>
  );
}

interface ChapterItemProps {
  chapter: VideoChapter;
}

function ChapterItem({ chapter }: ChapterItemProps) {
  const duration = chapter.endTime
    ? formatDuration(chapter.startTime, chapter.endTime)
    : "";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button className="w-full cursor-default flex items-center p-4 hover:bg-muted/50 transition-colors">
        <ChapterIcon />
        <ChapterContent
          title={chapter.title}
          description={chapter.description}
          startTime={chapter.startTime}
          duration={duration}
        />
      </button>
    </div>
  );
}

function ChapterIcon() {
  return (
    <div className="bg-accent/10 rounded-full h-10 w-10 flex items-center justify-center mr-4 flex-shrink-0">
      <Clock className="h-5 w-5" />
    </div>
  );
}

interface ChapterContentProps {
  title: string;
  description: string;
  startTime: string;
  duration: string;
}

function ChapterContent({
  title,
  description,
  startTime,
  duration,
}: ChapterContentProps) {
  return (
    <div className="flex-1 text-left">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-foreground">{title}</span>
        <ChapterTimestamp startTime={startTime} duration={duration} />
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {description}
      </p>
    </div>
  );
}

interface ChapterTimestampProps {
  startTime: string;
  duration: string;
}

function ChapterTimestamp({ startTime, duration }: ChapterTimestampProps) {
  return (
    <div className="flex items-center gap-2">
      {duration && (
        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
          {duration}
        </span>
      )}
      <span className="text-sm font-mono text-muted-foreground">
        {startTime}
      </span>
    </div>
  );
}
