"use client";

import { useState, useRef, useEffect } from "react";
import { TabsList } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ListChecks,
  AlertCircle,
  BookMarked,
  CheckSquare,
  Clock,
  Layers,
} from "lucide-react";
import { TabWithTooltip } from "./tab-with-tooltip";
import { checkOverflow, scrollElement } from "../utils/scroll-handler";
import type { AnalysisResult } from "@/components/results-content";

interface TabListProps {
  result: AnalysisResult;
  skipSummary?: boolean;
}

/**
 * Tab list component with scrolling
 */
export function ResultsTabList({ result, skipSummary = false }: TabListProps) {
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Check if tabs need scrolling
  useEffect(() => {
    const handleResize = () => {
      setShowScrollButtons(checkOverflow(tabsListRef.current));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to scroll tabs
  const handleScroll = (direction: "left" | "right") => {
    scrollElement(tabsListRef.current, direction);
  };

  // Check which tabs should be displayed
  const hasGlossary =
    result.glossary && Object.keys(result.glossary).length > 0;
  const hasPresentationQuality = !!result.presentationQuality;
  const hasDecisions = result.decisionsMade && result.decisionsMade.length > 0;
  const hasActionItems = result.actionItems && result.actionItems.length > 0;

  return (
    <div className="flex items-center flex-1 overflow-hidden w-full sm:w-auto">
      {showScrollButtons && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 mr-1 z-10"
          onClick={() => handleScroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <ScrollArea className="max-w-full">
        <div ref={tabsListRef} className="flex overflow-x-auto scrollbar-none">
          <TabsList className="flex p-1 bg-muted rounded-lg border w-max">
            {!skipSummary && (
              <TabWithTooltip
                value="summary"
                icon={<BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                label="Summary"
              />
            )}
            <TabWithTooltip
              value="keypoints"
              icon={<ListChecks className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              label="Key Points"
            />
            {hasDecisions && (
              <TabWithTooltip
                value="outcomes"
                icon={<Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                label="Decisions"
              />
            )}
            {hasActionItems && (
              <TabWithTooltip
                value="actions"
                icon={<CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                label="Tasks"
              />
            )}
            <TabWithTooltip
              value="chapters"
              icon={<Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              label="Chapters"
            />
            {hasPresentationQuality && (
              <TabWithTooltip
                value="quality"
                icon={<AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                label="Quality"
              />
            )}
            {hasGlossary && (
              <TabWithTooltip
                value="glossary"
                icon={<BookMarked className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                label="Glossary"
              />
            )}
          </TabsList>
        </div>
      </ScrollArea>

      {showScrollButtons && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 ml-1 z-10"
          onClick={() => handleScroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
