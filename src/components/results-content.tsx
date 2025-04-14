"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import type { VideoChapter } from "./video-chapters";
import ResultsTabs from "./results-tab";
import { ProgressCards } from "./progress-cards";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AuthStatus } from "./auth/auth-status";

export interface DifficultSegment {
  startTime: string;
  endTime: string;
  issue: string;
  improvement: string;
}

export interface PresentationQuality {
  overallClarity: string;
  difficultSegments: DifficultSegment[];
  improvementSuggestions: string[];
}

export interface AnalysisResult {
  title?: string;
  summary: string;
  keyPoints: string[];
  decisionsMade?: string[];
  actionItems?: {
    task: string;
    dueDate?: string;
  }[];
  videoChapters?: VideoChapter[];
  presentationQuality?: PresentationQuality;
  glossary?: Record<string, string>;
  analysisDate?: string;
}

// Function to delete a transcription file using the API
async function deleteTranscriptionFile(audioId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/delete-transcription/${audioId}`, {
      method: "DELETE",
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error deleting transcription:", error);
    return false;
  }
}

export default function ResultsContent({ audioId }: { audioId: string }) {
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [dataSource, setDataSource] = useState<"api" | "database">("api");
  const [shouldRunAnalysis, setShouldRunAnalysis] = useState<boolean | null>(
    null
  );
  const [analysisStatus, setAnalysisStatus] = useState<
    "loading" | "processing" | "completed" | "ready"
  >("loading");

  const language = searchParams?.get("language") || "english";

  const steps = [
    { name: "Loading transcription", progress: 10 },
    { name: "Processing audio", progress: 40 },
    { name: "Analysis completed", progress: 90 },
    { name: "Preparing results", progress: 100 },
  ];

  const userAnalysis = useQuery(api.audio.getAudioAnalysis, { url: audioId });
  const updateAudioAnalysis = useMutation(api.audio.updateAudioAnalysis);

  useEffect(() => {
    if (!isAuthLoading && userAnalysis !== undefined) {
      if (
        userAnalysis &&
        userAnalysis.summary &&
        userAnalysis.summary !== "Processing..."
      ) {
        console.log("Found complete analysis in database");
        setDataSource("database");

        setAnalysisStatus("completed");
        setCurrentStep(3);

        setTimeout(() => {
          setResult({
            title: userAnalysis.title || "",
            summary: userAnalysis.summary,
            keyPoints: userAnalysis.keyPoints || [],
            actionItems: [],
            decisionsMade: userAnalysis.meetingOutcomes || [],
            videoChapters: userAnalysis.audioChapters || [],
            presentationQuality: userAnalysis.presentationQuality || {
              overallClarity: "",
              difficultSegments: [],
              improvementSuggestions: [],
            },
            glossary: userAnalysis.glossary || {},
          });
          setProcessing(false);
          setShowResults(true);
          setAnalysisStatus("ready");
          setCurrentStep(3);
        }, 1500);

        setShouldRunAnalysis(false);
      } else {
        console.log("No complete analysis found in database");
        setShouldRunAnalysis(true);
      }
    }
  }, [userAnalysis, isAuthLoading]);

  useEffect(() => {
    if (shouldRunAnalysis === true) {
      console.log("Starting new analysis");
      processAudio();
    }
  }, [shouldRunAnalysis]);

  const saveAnalysisToConvex = async (analysisResult: AnalysisResult) => {
    if (!isAuthenticated) return;

    try {
      console.log("Saving analysis to database");

      await updateAudioAnalysis({
        url: audioId,
        title: analysisResult.title || `Audio ${audioId.substring(0, 8)}`,
        summary: analysisResult.summary,
        keyPoints: analysisResult.keyPoints,
        meetingOutcomes: analysisResult.decisionsMade || [],
        audioChapters:
          analysisResult.videoChapters?.map((chapter) => ({
            startTime: chapter.startTime || "00:00:00",
            endTime: chapter.endTime || "00:00:00",
            title: chapter.title,
            description: chapter.description || "",
          })) || [],
        presentationQuality: {
          overallClarity:
            analysisResult.presentationQuality?.overallClarity || "",
          difficultSegments:
            analysisResult.presentationQuality?.difficultSegments?.map(
              (segment) => ({
                startTime: segment.startTime,
                endTime: segment.endTime,
                issue: segment.issue,
                improvement: segment.improvement || "",
              })
            ) || [],
          improvementSuggestions:
            analysisResult.presentationQuality?.improvementSuggestions || [],
        },
        glossary: analysisResult.glossary || {},
        analysisDate: new Date().toISOString(),
      });

      console.log("Analysis saved to database successfully");
    } catch (error) {
      console.error("Error saving analysis to database:", error);
      toast.error("Failed to save analysis to database");
    }
  };

  const processAudio = async () => {
    if (!audioId) return;

    try {
      setAnalysisStatus("processing");
      setCurrentStep(1);

      const transcriptionRes = await fetch(`/api/get-transcription/${audioId}`);

      if (!transcriptionRes.ok) {
        throw new Error(
          `Failed to get transcription. Status: ${transcriptionRes.status}`
        );
      }

      const { transcription } = await transcriptionRes.json();

      if (!transcription) {
        throw new Error("No transcription found for this audio");
      }

      const metadataRes = await fetch(`/api/get-audio-metadata/${audioId}`);
      let originalFileName = null;

      if (metadataRes.ok) {
        try {
          const metadata = await metadataRes.json();
          originalFileName = metadata.originalFileName;
          console.log("Retrieved original filename:", originalFileName);
        } catch (err) {
          console.warn("Could not parse audio metadata", err);
        }
      }

      setCurrentStep(2);

      const response = await fetch(`/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioId,
          audioDetails: {
            title:
              originalFileName || `Audio Recording ${audioId.substring(0, 8)}`,
            originalFileName: originalFileName,
            id: audioId,
          },
          transcription,
          outputLanguage: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed. Status: ${response.status}`);
      }

      const analysisResult = await response.json();
      setCurrentStep(3);
      setResult(analysisResult);
      setDataSource("api");

      await saveAnalysisToConvex(analysisResult);

      setAnalysisStatus("completed");

      // Clean up transcription file if analysis was successful and the data is stored in the database
      if (isAuthenticated && dataSource === "api") {
        try {
          // Small delay to ensure all data is properly saved first
          setTimeout(async () => {
            const deleted = await deleteTranscriptionFile(audioId);
            if (deleted) {
              console.log(`Cleaned up transcription file for ${audioId}`);
            }
          }, 5000);
        } catch (cleanupError) {
          console.warn(
            `Failed to clean up transcription file: ${cleanupError}`
          );
          // Non-critical error, don't interrupt the flow
        }
      }

      setTimeout(() => {
        setProcessing(false);
        setShowResults(true);
        setAnalysisStatus("ready");
        setCurrentStep(3);
      }, 1500);
    } catch (error) {
      setError(
        `An error occurred during audio analysis: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setProcessing(false);
      console.error("Audio analysis error:", error);
    }
  };

  const renderAuthInfo = () => {
    if (isAuthLoading) return null;

    if (!isAuthenticated) {
      return <AuthStatus />;
    }

    return null;
  };

  if (processing && !showResults) {
    return (
      <Card className="border shadow-md">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            Analysis Progress
          </h2>
          <ProgressCards currentStep={currentStep} startTime={startTime} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 border-destructive shadow-md">
        <CardContent className="pt-6 p-8">
          <h2 className="text-xl font-semibold text-destructive mb-4 text-center">
            An error occurred
          </h2>
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result || !showResults) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin " />
        <span className="ml-2 text-muted-foreground">
          {dataSource === "database"
            ? "Loading saved analysis..."
            : "Processing audio analysis..."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderAuthInfo()}

      {processing && (
        <Card className="border shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center text-center">
              {analysisStatus === "loading" && (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {steps[currentStep].name}
                  </h3>
                </>
              )}

              {analysisStatus === "processing" && (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {steps[currentStep].name}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    This may take a few minutes
                  </p>
                </>
              )}

              {analysisStatus === "completed" && (
                <>
                  <CheckIcon className="h-10 w-10 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {steps[currentStep].name}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    Preparing results...
                  </p>
                </>
              )}

              <div className="w-full max-w-md mx-auto mt-4 bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${steps[currentStep].progress}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">An error occurred</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      )}

      {showResults && result && (
        <>
          <Card className="border shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {result.summary}
              </p>
            </CardContent>
          </Card>

          <ResultsTabs result={result} skipSummary={true} />
        </>
      )}
    </div>
  );
}
