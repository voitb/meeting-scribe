import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AudioForm from "@/components/video-form";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { RecentAudioSection } from "@/components/sections/recent-audio-section";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <HeroSection />

          <Suspense
            fallback={
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                <span className="ml-2 text-muted-foreground">Loading...</span>
              </div>
            }
          >
            <AudioForm />
          </Suspense>

          <div className="mt-24 space-y-16">
            <HowItWorksSection />
            <Suspense
              fallback={
                <div className="h-20 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <RecentAudioSection />
            </Suspense>
            <FeaturesSection />
          </div>
        </div>
      </div>
    </main>
  );
}
