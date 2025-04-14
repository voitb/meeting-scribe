"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { AnalysisResult } from "../results-content";
import { ResultsTabList } from "./tabs/tab-list";
import { DownloadPdfButton } from "./actions/download-pdf-button";
import { seekAudio } from "./utils/seek-audio";
import { SummaryTab } from "./tabs/summary-tab";
import { KeyPointsTab } from "./tabs/keypoints-tab";
import { DecisionsTab } from "./tabs/decisions-tab";
import { ActionsTab } from "./tabs/actions-tab";
import { ChaptersTab } from "./tabs/chapters-tab";
import { QualityTab } from "./tabs/quality-tab";
import { GlossaryTab } from "./tabs/glossary-tab";

interface ResultsTabsProps {
  result: AnalysisResult;
  skipSummary?: boolean;
}

/**
 * Component displaying analysis results in tabs
 */
export default function ResultsTabs({
  result,
  skipSummary = false,
}: ResultsTabsProps) {
  const handleChapterClick = (seconds: number) => {
    toast.info(`Seeking to ${seconds} seconds`);
    seekAudio(seconds);
  };

  const hasGlossary =
    result.glossary && Object.keys(result.glossary).length > 0;
  const hasPresentationQuality = !!result.presentationQuality;
  const hasDecisions = result.decisionsMade && result.decisionsMade.length > 0;
  const hasActionItems = result.actionItems && result.actionItems.length > 0;

  return (
    <Card className="border shadow-md">
      <Tabs defaultValue="keypoints" className="w-full">
        <div className="flex flex-row justify-between items-start sm:items-center px-4 sm:px-6 pt-4 sm:pt-6 gap-3 sm:gap-0">
          <ResultsTabList result={result} skipSummary={skipSummary} />
          <DownloadPdfButton result={result} />
        </div>

        <CardContent className="p-3 sm:p-6">
          {!skipSummary && (
            <TabsContent value="summary" className="mt-0">
              <SummaryTab summary={result.summary} />
            </TabsContent>
          )}

          <TabsContent value="keypoints" className="mt-0">
            <KeyPointsTab keyPoints={result.keyPoints} />
          </TabsContent>

          {hasDecisions && (
            <TabsContent value="outcomes" className="mt-0">
              <DecisionsTab decisions={result.decisionsMade || []} />
            </TabsContent>
          )}

          {hasActionItems && (
            <TabsContent value="actions" className="mt-0">
              <ActionsTab actions={result.actionItems || []} />
            </TabsContent>
          )}

          <TabsContent value="chapters" className="mt-0">
            <ChaptersTab
              chapters={result.videoChapters || []}
              onChapterClick={handleChapterClick}
            />
          </TabsContent>

          {hasPresentationQuality && (
            <TabsContent value="quality" className="mt-0">
              <QualityTab
                quality={result.presentationQuality!}
                onSegmentClick={handleChapterClick}
              />
            </TabsContent>
          )}

          {hasGlossary && (
            <TabsContent value="glossary" className="mt-0">
              <GlossaryTab glossary={result.glossary!} />
            </TabsContent>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
}
