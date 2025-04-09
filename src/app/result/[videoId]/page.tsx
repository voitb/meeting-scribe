import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ResultsContent from "@/components/results-content";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;

  if (!videoId) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <ThemeToggle />
        </header>

        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
              Learning Materials
            </h1>
            <div className="aspect-video w-full mb-6 rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Loading content...
                </span>
              </div>
            }
          >
            <ResultsContent videoId={videoId} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
