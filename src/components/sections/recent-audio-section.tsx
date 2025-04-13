"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { LoginButton } from "../auth/login-button";

export function RecentAudioSection() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const recentAudio = useQuery(api.audio.getRecentAudioAnalyses);

  // If loading, show nothing yet
  if (isLoading) return null;

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <section id="recent-audio" className="py-8">
        <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Access Your Analysis History
                </h3>
                <p className="text-blue-600 dark:text-blue-400 mb-2">
                  Log in to save your analyses and access them anytime
                </p>
              </div>
              <LoginButton />
            </div>
          </CardContent>
        </Card>
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
        <Card className="bg-accent/10">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t analyzed any audio files yet
            </p>
          </CardContent>
        </Card>
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
            <Card
              key={audio._id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="mb-2 text-lg font-medium line-clamp-1">
                  {audio.title}
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {audio.summary.substring(0, 120)}...
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formattedDate}
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/result/${audio.url.split("/").pop()}`}>
                      View Results
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
