import { YoutubeAnalyzer } from "@/components/youtube-analyzer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <div className="container mx-auto py-8 px-4">
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Analizator Filmów YouTube
            </h1>
            <p className="text-muted-foreground text-lg">
              Transkrybuj, analizuj i podsumowuj zawartość filmów z YouTube
            </p>
          </header>

          <YoutubeAnalyzer />

          <footer className="mt-16 text-center text-sm text-muted-foreground">
            <p>
              Wykorzystuje Groq API i Whisper do transkrypcji oraz analizy
              tekstu.
            </p>
          </footer>
        </div>
        <Toaster />
      </ThemeProvider>
    </main>
  );
}
