"use client";

import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import type { PresentationQuality } from "./results-content";

interface PresentationQualityViewProps {
  quality: PresentationQuality;
  onSegmentClick: (seconds: number) => void;
}

export default function PresentationQualityView({
  quality,
  onSegmentClick,
}: PresentationQualityViewProps) {
  // Convert time range (00:00:00-00:00:00) to seconds for the start time
  const timeRangeToSeconds = (timeRange: string): number => {
    const startTime = timeRange.split("-")[0];
    const parts = startTime.split(":").map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">
          Presentation Quality Analysis
        </h3>
        <div className="bg-muted p-6 rounded-lg mb-6">
          <p className="text-foreground">{quality.overallClarity}</p>
        </div>
      </div>

      {quality.difficultSegments && quality.difficultSegments.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3 text-foreground">
            Areas for Improvement
          </h4>
          <div className="space-y-4">
            {quality.difficultSegments.map((segment, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden"
              >
                <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="font-medium">Segment {index + 1}</span>
                  </div>
                  <button
                    onClick={() =>
                      onSegmentClick(timeRangeToSeconds(segment.timeRange))
                    }
                    className="text-sm font-mono hover:underline flex items-center"
                  >
                    {segment.timeRange} <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="font-medium">Issue: </span>
                    <span className="text-foreground">{segment.issue}</span>
                  </div>
                  <div>
                    <span className="font-medium">Suggested improvement: </span>
                    <span className="text-foreground">
                      {segment.improvement}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quality.improvementSuggestions &&
        quality.improvementSuggestions.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-foreground">
              General Improvement Suggestions
            </h4>
            <ul className="space-y-2">
              {quality.improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="bg-muted p-3 rounded-lg flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}
