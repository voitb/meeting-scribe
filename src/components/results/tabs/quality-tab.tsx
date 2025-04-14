"use client";

import PresentationQualityView from "@/components/presentation-quality-view";
import type { PresentationQuality } from "@/components/results-content";

interface QualityTabProps {
  quality: PresentationQuality;
  onSegmentClick: (seconds: number) => void;
}

/**
 * Presentation quality tab component
 */
export function QualityTab({ quality, onSegmentClick }: QualityTabProps) {
  if (!quality) return null;

  return (
    <PresentationQualityView
      quality={quality}
      onSegmentClick={onSegmentClick}
    />
  );
}
