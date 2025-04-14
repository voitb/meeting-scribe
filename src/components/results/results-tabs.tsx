import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisResult } from "@/types/analysis";
import { ResultsTabList } from "./tabs/tab-list";
import { SummaryTab } from "./tabs/summary-tab";
import { KeyPointsTab } from "./tabs/keypoints-tab";
import { DecisionsTab } from "./tabs/decisions-tab";
import { ActionsTab } from "./tabs/actions-tab";
import { ChaptersTab } from "./tabs/chapters-tab";
import { QualityTab } from "./tabs/quality-tab";
import { GlossaryTab } from "./tabs/glossary-tab";
import { DownloadPdfButton } from "./download-pdf-button";
import { motion, AnimatePresence } from "framer-motion";

interface ResultsTabsProps {
  result: AnalysisResult;
  skipSummary?: boolean;
}

// Komponent opakowujący dla animacji zawartości zakładek
const AnimatedTabContent = ({ children }: { children: React.ReactNode }) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default function ResultsTabs({
  result,
  skipSummary = false,
}: ResultsTabsProps) {
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
              <AnimatePresence mode="wait">
                <AnimatedTabContent>
                  <SummaryTab summary={result.summary} />
                </AnimatedTabContent>
              </AnimatePresence>
            </TabsContent>
          )}

          <TabsContent value="keypoints" className="mt-0">
            <AnimatePresence mode="wait">
              <AnimatedTabContent>
                <KeyPointsTab keyPoints={result.keyPoints} />
              </AnimatedTabContent>
            </AnimatePresence>
          </TabsContent>

          {hasDecisions && (
            <TabsContent value="outcomes" className="mt-0">
              <AnimatePresence mode="wait">
                <AnimatedTabContent>
                  <DecisionsTab decisions={result.decisionsMade || []} />
                </AnimatedTabContent>
              </AnimatePresence>
            </TabsContent>
          )}

          {hasActionItems && (
            <TabsContent value="actions" className="mt-0">
              <AnimatePresence mode="wait">
                <AnimatedTabContent>
                  <ActionsTab actions={result.actionItems || []} />
                </AnimatedTabContent>
              </AnimatePresence>
            </TabsContent>
          )}

          <TabsContent value="chapters" className="mt-0">
            <AnimatePresence mode="wait">
              <AnimatedTabContent>
                <ChaptersTab chapters={result.videoChapters || []} />
              </AnimatedTabContent>
            </AnimatePresence>
          </TabsContent>

          {hasPresentationQuality && (
            <TabsContent value="quality" className="mt-0">
              <AnimatePresence mode="wait">
                <AnimatedTabContent>
                  <QualityTab quality={result.presentationQuality!} />
                </AnimatedTabContent>
              </AnimatePresence>
            </TabsContent>
          )}

          {hasGlossary && (
            <TabsContent value="glossary" className="mt-0">
              <AnimatePresence mode="wait">
                <AnimatedTabContent>
                  <GlossaryTab glossary={result.glossary!} />
                </AnimatedTabContent>
              </AnimatePresence>
            </TabsContent>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
}
