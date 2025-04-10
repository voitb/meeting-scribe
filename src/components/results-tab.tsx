"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  BookOpen,
  ListChecks,
  Clock,
  AlertCircle,
  BookMarked,
} from "lucide-react";
import { toast } from "sonner";
import { VideoChapters } from "./video-chapters";
import type { AnalysisResult } from "./results-content";
import PresentationQualityView from "./presentation-quality-view";
import GlossaryView from "./glossary-view";

export default function ResultsTabs({ result }: { result: AnalysisResult }) {
  const handleDownloadPdf = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "video-analysis.pdf";

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF file has been generated");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Error generating PDF");
    }
  };

  const handleChapterClick = (seconds: number) => {
    toast.info(`Seeking to ${seconds} seconds`);

    const event = new CustomEvent("seek-video", { detail: { seconds } });
    window.dispatchEvent(event);
  };

  const hasGlossary =
    result.glossary && Object.keys(result.glossary).length > 0;
  const hasPresentationQuality = !!result.presentationQuality;

  return (
    <Card className="border shadow-md">
      <Tabs defaultValue="summary" className="w-full">
        <div className="flex justify-between items-center px-6 pt-6">
          <TabsList className="flex p-1 bg-muted rounded-lg border overflow-x-auto">
            <TabsTrigger
              value="summary"
              className="flex items-center gap-2 flex-1"
            >
              <BookOpen className="h-4 w-4" />
              <span>Summary</span>
            </TabsTrigger>
            <TabsTrigger
              value="keypoints"
              className="flex items-center gap-2 flex-1"
            >
              <ListChecks className="h-4 w-4" />
              <span>Key Points</span>
            </TabsTrigger>
            <TabsTrigger
              value="chapters"
              className="flex items-center gap-2 flex-1"
            >
              <Clock className="h-4 w-4" />
              <span>Chapters</span>
            </TabsTrigger>
            {hasPresentationQuality && (
              <TabsTrigger
                value="quality"
                className="flex items-center gap-2 flex-1"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Quality</span>
              </TabsTrigger>
            )}
            {hasGlossary && (
              <TabsTrigger
                value="glossary"
                className="flex items-center gap-2 flex-1"
              >
                <BookMarked className="h-4 w-4" />
                <span>Glossary</span>
              </TabsTrigger>
            )}
          </TabsList>

          <Button onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download as PDF
          </Button>
        </div>

        <CardContent className="p-6">
          <TabsContent value="summary" className="mt-0">
            <div className="prose max-w-none dark:prose-invert">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Video Summary
              </h3>
              <div className="bg-muted p-6 rounded-lg">
                <p className="text-foreground whitespace-pre-line">
                  {result.summary}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="keypoints" className="mt-0">
            <div className="prose max-w-none dark:prose-invert">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Key Points
              </h3>
              <ul className="space-y-3">
                {result.keyPoints.map((point, index) => (
                  <li key={index} className="bg-muted p-4 rounded-lg flex">
                    <div className="rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="font-semibold text-foreground text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="chapters" className="mt-0">
            {result.videoChapters && result.videoChapters.length > 0 ? (
              <VideoChapters
                chapters={result.videoChapters}
                onChapterClick={handleChapterClick}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No chapters found for this video.</p>
              </div>
            )}
          </TabsContent>

          {hasPresentationQuality && (
            <TabsContent value="quality" className="mt-0">
              <PresentationQualityView
                quality={result.presentationQuality!}
                onSegmentClick={handleChapterClick}
              />
            </TabsContent>
          )}

          {hasGlossary && (
            <TabsContent value="glossary" className="mt-0">
              <GlossaryView glossary={result.glossary!} />
            </TabsContent>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
}
