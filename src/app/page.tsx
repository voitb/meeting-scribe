import { Suspense } from "react";
import VideoForm from "@/components/video-form";
import {
  Loader2,
  BookOpen,
  Clock,
  FileText,
  Download,
  MessageSquare,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with theme toggle */}
        <header className="flex justify-end mb-8">
          <ThemeToggle />
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-accent/50 rounded-full mb-4">
              <span className="text-sm font-medium text-foreground">
                AI-Powered Learning
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              YouTube Learning Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform YouTube videos into comprehensive educational materials
              with the power of AI
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                <span className="ml-2 text-muted-foreground">Loading...</span>
              </div>
            }
          >
            <VideoForm />
          </Suspense>

          <div className="mt-24 space-y-16">
            {/* How it works section */}
            <section className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-12">
                How it works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-6">
                  <div className="bg-accent/40 rounded-full p-4 mb-6">
                    <FileText className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Paste YouTube URL
                  </h3>
                  <p className="text-muted-foreground">
                    Enter the link to any educational YouTube video you want to
                    analyze
                  </p>
                </div>
                <div className="flex flex-col items-center p-6">
                  <div className="bg-accent/40 rounded-full p-4 mb-6">
                    <svg
                      className="h-8 w-8 text-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L6.5 11H17.5L12 2Z" fill="currentColor" />
                      <path
                        d="M17.5 22C15.0147 22 13 19.9853 13 17.5C13 15.0147 15.0147 13 17.5 13C19.9853 13 22 15.0147 22 17.5C22 19.9853 19.9853 22 17.5 22Z"
                        fill="currentColor"
                      />
                      <path d="M3 13.5H11V21.5H3V13.5Z" fill="currentColor" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    AI Processing
                  </h3>
                  <p className="text-muted-foreground">
                    Our advanced AI analyzes the video content and extracts
                    valuable information
                  </p>
                </div>
                <div className="flex flex-col items-center p-6">
                  <div className="bg-accent/40 rounded-full p-4 mb-6">
                    <BookOpen className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Get Materials
                  </h3>
                  <p className="text-muted-foreground">
                    Receive a complete package of learning materials ready to
                    use
                  </p>
                </div>
              </div>
            </section>

            {/* Features section */}
            <section className="bg-card rounded-xl p-10 shadow-md border">
              <h2 className="text-3xl font-bold text-card-foreground mb-10 text-center">
                Powerful Features
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-start">
                  <div className="bg-accent/10 rounded-full p-3 mr-4">
                    <FileText className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      Automatic Transcription
                    </h3>
                    <p className="text-muted-foreground">
                      Convert audio to text with advanced speech recognition
                      technology
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-accent/10 rounded-full p-3 mr-4">
                    <BookOpen className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      Smart Summaries
                    </h3>
                    <p className="text-muted-foreground">
                      Generate concise, accurate summaries of even the longest
                      videos
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-accent/10 rounded-full p-3 mr-4">
                    <svg
                      className="h-6 w-6 text-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L6.5 11H17.5L12 2Z" fill="currentColor" />
                      <path
                        d="M17.5 22C15.0147 22 13 19.9853 13 17.5C13 15.0147 15.0147 13 17.5 13C19.9853 13 22 15.0147 22 17.5C22 19.9853 19.9853 22 17.5 22Z"
                        fill="currentColor"
                      />
                      <path d="M3 13.5H11V21.5H3V13.5Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      Key Points Extraction
                    </h3>
                    <p className="text-muted-foreground">
                      Automatically identify and extract the most important
                      concepts and information
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-accent/10 rounded-full p-3 mr-4">
                    <MessageSquare className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      Discussion Questions
                    </h3>
                    <p className="text-muted-foreground">
                      Generate thought-provoking questions to deepen
                      understanding and engagement
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-accent/10 rounded-full p-3 mr-4">
                    <Clock className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      Time Chapters
                    </h3>
                    <p className="text-muted-foreground">
                      Divide videos into logical sections with timestamps for
                      easy navigation
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-accent/10 rounded-full p-3 mr-4">
                    <Download className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      PDF Export
                    </h3>
                    <p className="text-muted-foreground">
                      Save all materials in a convenient format for offline use
                      and sharing
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
