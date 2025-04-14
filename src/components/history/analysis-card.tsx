"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, FileAudio } from "lucide-react";
import { formatDistance } from "date-fns";

export interface AnalysisCardProps {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  keyPoints: string[];
  hasAudio: boolean;
}

export function AnalysisCard({
  id,
  title,
  summary,
  date,
  url,
  keyPoints,
  hasAudio,
}: AnalysisCardProps) {
  const formattedDate = formatDistance(new Date(date), new Date(), {
    addSuffix: true,
  });

  return (
    <Card
      key={id}
      className="overflow-hidden flex flex-col h-full hover:shadow-md transition-all border-muted/70 hover:border-primary/30"
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-medium text-lg line-clamp-2">{title}</h3>
          {hasAudio && (
            <div className="flex-shrink-0 text-primary" title="Audio available">
              <FileAudio className="h-5 w-5" />
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
          {summary.substring(0, 150)}...
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {keyPoints.slice(0, 2).map((point, idx) => (
            <div
              key={idx}
              className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full truncate max-w-[200px]"
            >
              {point.substring(0, 30)}
              {point.length > 30 ? "..." : ""}
            </div>
          ))}
          {keyPoints.length > 2 && (
            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              +{keyPoints.length - 2} more
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-3 border-t bg-muted/10 flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formattedDate}</span>
        </div>

        <Button size="sm" variant="default" asChild>
          <Link href={`/result/${url}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
