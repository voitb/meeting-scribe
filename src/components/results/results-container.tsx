"use client";

import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import ResultsContent from "@/components/results-content";
import { Navbar } from "@/components/navbar";
import { useAudioAnalysis } from "@/hooks/use-audio-analysis";
import { LoadingState } from "@/components/ui/loading-state";
import { AudioHeader } from "@/components/audio/audio-header";
import { BackButton } from "@/components/ui/back-button";

export function ResultsContainer() {
  const params = useParams();
  const audioId = params?.audioId as string;
  const { isLoading, title } = useAudioAnalysis(audioId);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ScrollArea className="h-screen">
      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
          <BackButton />
          <AudioHeader title={title} />
          <ResultsContent audioId={audioId} />
        </div>
      </main>
    </ScrollArea>
  );
}
