"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowRightIcon,
  FileTextIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";

// Interfejs dla danych analizy
interface AnalysisResult {
  title?: string;
  summary: string;
  keyPoints: string[];
  discussionQuestions: string[];
  transcription?: string;
}

export function YoutubeAnalyzer() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "Pobieranie audio",
    "Tworzenie transkrypcji",
    "Analiza tekstu",
    "Przygotowanie wyników",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja URL
    if (!youtubeUrl.trim()) {
      toast.error("Proszę podać URL filmu z YouTube");
      return;
    }

    try {
      // Resetujemy stan
      setProcessing(true);
      setCurrentStep(0);
      setProgress(0);
      setResult(null);
      setError(null);

      // Krok 1: Pobranie audio i transkrypcja
      setCurrentStep(1);
      setProgress(25);

      const transcriptionResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json();
        throw new Error(errorData.error || "Błąd podczas transkrypcji");
      }

      const transcriptionData = await transcriptionResponse.json();

      // Krok 2: Transkrypcja zakończona
      setCurrentStep(2);
      setProgress(50);

      // Krok 3: Analiza tekstu
      const analyzeResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcriptionData.transcription,
          title: transcriptionData.title,
        }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || "Błąd podczas analizy");
      }

      // Krok 4: Przygotowanie wyników
      setCurrentStep(3);
      setProgress(75);

      const analysisData = await analyzeResponse.json();

      // Finalizacja
      setProgress(100);
      setResult({
        title: transcriptionData.title,
        summary: analysisData.summary,
        keyPoints: analysisData.keyPoints,
        discussionQuestions: analysisData.discussionQuestions,
        transcription: transcriptionData.transcription,
      });

      toast.success("Analiza zakończona pomyślnie!");
    } catch (error) {
      console.error("Błąd:", error);
      setError(
        error instanceof Error ? error.message : "Wystąpił nieznany błąd"
      );
      toast.error("Wystąpił błąd podczas analizy");
    } finally {
      setProcessing(false);
    }
  };

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
          keyPoints: result.keyPoints,
          discussionQuestions: result.discussionQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się wygenerować pliku PDF");
      }

      // Pobierz blob z odpowiedzi
      const blob = await response.blob();

      // Utwórz URL dla pobierania
      const url = window.URL.createObjectURL(blob);

      // Utwórz element anchor do pobrania
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "analiza-filmu.pdf";

      // Dodaj element do DOM i kliknij, aby pobrać
      document.body.appendChild(a);
      a.click();

      // Posprzątaj
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Plik PDF został wygenerowany");
    } catch (error) {
      console.error("Błąd generowania PDF:", error);
      toast.error("Błąd podczas generowania PDF");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Podaj link do filmu</CardTitle>
          <CardDescription>
            Wklej adres URL filmu z YouTube, który chcesz przeanalizować
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2"
          >
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1"
              disabled={processing}
            />
            <Button type="submit" disabled={processing}>
              {processing ? (
                "Przetwarzanie..."
              ) : (
                <>
                  Analizuj <ArrowRightIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {processing && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Postęp analizy</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              {steps[currentStep]} ({Math.round(progress)}%)
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-8 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Wystąpił błąd</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Wyniki analizy</CardTitle>
              {result.title && (
                <CardDescription className="text-lg font-medium">
                  {result.title}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Streszczenie</h3>
                <p className="text-muted-foreground">{result.summary}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Najważniejsze punkty
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  {result.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Pytania do dyskusji
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  {result.discussionQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => window.open(youtubeUrl, "_blank")}
              >
                Otwórz film
              </Button>
              <Button onClick={handleDownloadPdf}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Pobierz PDF
              </Button>
            </CardFooter>
          </Card>

          {result.transcription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5" />
                  Pełna transkrypcja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-y-auto p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {result.transcription}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
