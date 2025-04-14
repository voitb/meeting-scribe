"use client";

import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import type { PresentationQuality } from "@/types/analysis";

interface PresentationQualityViewProps {
  quality: PresentationQuality;
  onSegmentClick?: (start: string, end: string) => void;
}

export default function PresentationQualityView({
  quality,
  onSegmentClick,
}: PresentationQualityViewProps) {
  return (
    <div className="space-y-6">
      <QualityOverview clarityText={quality.overallClarity} />

      {quality.difficultSegments && quality.difficultSegments.length > 0 && (
        <DifficultSegments
          segments={quality.difficultSegments}
          onSegmentClick={onSegmentClick}
        />
      )}

      {quality.improvementSuggestions &&
        quality.improvementSuggestions.length > 0 && (
          <ImprovementSuggestions
            suggestions={quality.improvementSuggestions}
          />
        )}
    </div>
  );
}

function QualityOverview({ clarityText }: { clarityText: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-foreground">
        Presentation Quality Analysis
      </h3>
      <div className="bg-muted p-6 rounded-lg mb-6">
        <p className="text-foreground">{clarityText}</p>
      </div>
    </div>
  );
}

interface DifficultSegmentsProps {
  segments: PresentationQuality["difficultSegments"];
  onSegmentClick?: (start: string, end: string) => void;
}

function DifficultSegments({
  segments,
  onSegmentClick,
}: DifficultSegmentsProps) {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-3 text-foreground">
        Areas for Improvement
      </h4>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <SegmentCard
            key={index}
            segment={segment}
            index={index}
            onSegmentClick={onSegmentClick}
          />
        ))}
      </div>
    </div>
  );
}

interface SegmentCardProps {
  segment: PresentationQuality["difficultSegments"][number];
  index: number;
  onSegmentClick?: (start: string, end: string) => void;
}

function SegmentCard({ segment, index, onSegmentClick }: SegmentCardProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          <span className="font-medium">Segment {index + 1}</span>
        </div>
        <button
          className="text-sm font-mono hover:underline flex items-center"
          onClick={() =>
            onSegmentClick && onSegmentClick(segment.startTime, segment.endTime)
          }
          title="Przejdź do segmentu"
          type="button"
        >
          {segment.startTime} - {segment.endTime}{" "}
          <ArrowRight className="h-3 w-3 ml-1" />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-2">
          <span className="font-medium">Issue: </span>
          <span className="text-foreground">{segment.issue}</span>
        </div>
        <div>
          <span className="font-medium">Suggested improvement: </span>
          <span className="text-foreground">{segment.improvement}</span>
        </div>
      </div>
    </div>
  );
}

interface ImprovementSuggestionsProps {
  suggestions: string[];
}

function ImprovementSuggestions({ suggestions }: ImprovementSuggestionsProps) {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-3 text-foreground">
        General Improvement Suggestions
      </h4>
      <ul className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="bg-muted p-3 rounded-lg flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-foreground">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
