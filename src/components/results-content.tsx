"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Loader2,
  FileText,
  BookOpen,
  ListChecks,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
  title?: string;
  summary: string;
  keyPoints: string[];
  discussionQuestions: string[];
  transcription?: string;
}

export default function ResultsContent({ videoId }: { videoId: string }) {
  const [processing, setProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputLanguage, setOutputLanguage] = useState("english");

  const steps = [
    "Downloading audio",
    "Creating transcription",
    "Analyzing text",
    "Preparing results",
  ];

  useEffect(() => {
    const processVideo = async () => {
      try {
        setProcessing(true);
        setCurrentStep(0);
        setProgress(0);
        setResult(null);
        setError(null);

        setCurrentStep(1);
        setProgress(25);

        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const transcriptionResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: youtubeUrl,
            language: "auto",
          }),
        });

        if (!transcriptionResponse.ok) {
          const errorData = await transcriptionResponse.json();
          throw new Error(errorData.error || "Transcription error");
        }

        const transcriptionData = await transcriptionResponse.json();

        setCurrentStep(2);
        setProgress(50);

        const analyzeResponse = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...transcriptionData,
            outputLanguage,
          }),
        });

        if (!analyzeResponse.ok) {
          const errorData = await analyzeResponse.json();
          throw new Error(errorData.error || "Analysis error");
        }

        setCurrentStep(3);
        setProgress(75);

        const analysisData = await analyzeResponse.json();

        setProgress(100);
        setResult({
          title: transcriptionData.title,
          summary: analysisData.summary,
          keyPoints: analysisData.keyPoints,
          discussionQuestions: analysisData.discussionQuestions,
          transcription: transcriptionData.transcription,
        });

        toast.success("Analysis completed successfully!");
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        toast.error("An error occurred during analysis");
      } finally {
        setProcessing(false);
      }
    };

    processVideo();
  }, [videoId, outputLanguage]);

  const handleDownloadPdf = async () => {
    if (!result) return;

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: result.title,
          summary: result.summary,
          keyPoints: result?.keyPoints,
          discussionQuestions: result.discussionQuestions,
        }),
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

  if (processing) {
    return (
      <Card className="mb-8 border shadow-md">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            Analysis Progress
          </h2>
          <Progress value={progress} className="h-3 mb-6" />
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            <p className="text-center text-muted-foreground">
              {steps[currentStep]} ({Math.round(progress)}%)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 border-destructive shadow-md">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-destructive mb-4 text-center">
            An Error Occurred
          </h2>
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        <span className="ml-2 text-muted-foreground">Loading results...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Generated Educational Materials
        </h2>
        <Button onClick={handleDownloadPdf}>
          <Download className="mr-2 h-4 w-4" />
          Download as PDF
        </Button>
      </div>

      <Card className="border shadow-md">
        <Tabs defaultValue="summary" className="w-full">
          <div className="px-6">
            <TabsList className="flex p-1 bg-muted rounded-t-lg border-b">
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
            </TabsList>
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
                      <div className="bg-accent/10 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
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

            <TabsContent value="questions" className="mt-0">
              <div className="prose max-w-none dark:prose-invert">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Discussion Questions
                </h3>
                <ul className="space-y-3">
                  {result.discussionQuestions.map((question, index) => (
                    <li key={index} className="bg-muted p-4 rounded-lg">
                      <p className="font-semibold text-foreground mb-1">
                        Question {index + 1}:
                      </p>
                      <p className="text-foreground">{question}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="transcript" className="mt-0">
              <div className="prose max-w-none dark:prose-invert">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Full Transcript
                </h3>
                <div className="bg-muted p-4 rounded-lg max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                    {result.transcription}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
