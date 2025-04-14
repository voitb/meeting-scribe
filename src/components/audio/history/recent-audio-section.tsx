"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { LoginCard } from "./login-card";
import { EmptyStateCard } from "./empty-state-card";
import { AudioCard } from "./audio-card";

export function RecentAudioSection() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const recentAudio = useQuery(api.audio.getRecentAudioAnalyses);

  // If loading, show nothing yet
  if (isLoading) return null;

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <section id="recent-audio" className="py-8">
        <LoginCard />
      </section>
    );
  }

  // If authenticated but no recordings, show empty state
  if (!recentAudio || recentAudio.length === 0) {
    return (
      <section id="recent-audio" className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Recent Analyses
          </h2>
        </div>
        <EmptyStateCard />
      </section>
    );
  }

  // Show recent audio files
  return (
    <section id="recent-audio" className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Recent Analyses</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/history" className="flex items-center">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {recentAudio.map((audio) => {
          const date = new Date(audio.analysisDate);
          const formattedDate = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(date);

          return (
            <AudioCard
              key={audio._id}
              id={audio._id}
              title={audio.title}
              summary={audio.summary}
              date={formattedDate}
              url={audio.url.split("/").pop() || ""}
            />
          );
        })}
      </div>
    </section>
  );
}
