"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Loader2, FileAudio, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ResultsContent from "@/components/results-content";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const params = useParams();
  const audioId = params?.videoId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [audioTitle, setAudioTitle] = useState<string>("");

  useEffect(() => {
    if (!audioId) {
      notFound();
    } else {
      // Pobierz metadane, aby uzyskać oryginalną nazwę pliku
      const fetchMetadata = async () => {
        try {
          const metadataRes = await fetch(`/api/get-audio-metadata/${audioId}`);
          if (metadataRes.ok) {
            const metadata = await metadataRes.json();
            setAudioTitle(
              metadata.originalFileName || `Audio ${audioId.substring(0, 8)}`
            );
          } else {
            setAudioTitle(`Audio ${audioId.substring(0, 8)}`);
          }
        } catch (err) {
          console.warn("Could not fetch audio metadata", err);
          setAudioTitle(`Audio ${audioId.substring(0, 8)}`);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMetadata();
    }
  }, [audioId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading content...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-8 p-4 bg-muted/30 rounded-lg border">
          <FileAudio className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-medium">{audioTitle}</h1>
        </div>

        {!isLoading && <ResultsContent audioId={audioId} />}
      </div>
    </main>
  );
}
