"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { LoginButton } from "../auth/login-button";
import {
  AnimatedSectionHeading,
  AnimatedCard,
  AnimatedButtonContainer,
  AnimatedFadeInContainer,
} from "./animated-section-components";
import { AnimatedRecentAudioComponents } from "./recent-audio-animated";

export function RecentAudioSection() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const recentAudio = useQuery(api.audio.getRecentAudioAnalyses);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <section id="recent-audio" className="py-8">
        <AnimatedCard>
          <Card className="border shadow-sm bg-muted/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <AnimatedFadeInContainer>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Access Your Analysis History
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      Sign in to save your analyses and access them anytime
                    </p>
                  </div>
                </AnimatedFadeInContainer>
                <AnimatedButtonContainer>
                  <LoginButton />
                </AnimatedButtonContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </section>
    );
  }

  if (!recentAudio || recentAudio.length === 0) {
    return (
      <section id="recent-audio" className="py-8">
        <AnimatedSectionHeading className="text-2xl font-bold text-foreground mb-6">
          Recent Analyses
        </AnimatedSectionHeading>
        <AnimatedCard>
          <Card className="bg-accent/10">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                You haven&apos;t analyzed any audio files yet
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </section>
    );
  }

  return (
    <section id="recent-audio" className="py-8">
      <div className="flex justify-between items-center mb-6">
        <AnimatedSectionHeading className="text-2xl font-bold text-foreground m-0">
          Recent Analyses
        </AnimatedSectionHeading>
        <AnimatedRecentAudioComponents.ViewAllButton>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/history" className="flex items-center">
              View all
              <AnimatedRecentAudioComponents.ArrowIcon>
                <ArrowRight className="ml-1 h-4 w-4" />
              </AnimatedRecentAudioComponents.ArrowIcon>
            </Link>
          </Button>
        </AnimatedRecentAudioComponents.ViewAllButton>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {recentAudio.map((audio, index) => {
          const date = new Date(audio.analysisDate);
          const formattedDate = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(date);

          return (
            <AnimatedCard
              key={audio._id}
              index={index}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Card className="overflow-hidden transition-shadow h-full">
                <CardContent className="p-4">
                  <AnimatedRecentAudioComponents.CardTitle index={index}>
                    {audio.title}
                  </AnimatedRecentAudioComponents.CardTitle>
                  <AnimatedRecentAudioComponents.CardDescription index={index}>
                    {audio.summary.substring(0, 120)}...
                  </AnimatedRecentAudioComponents.CardDescription>
                  <div className="flex justify-between items-center">
                    <AnimatedRecentAudioComponents.CardDate index={index}>
                      <Clock className="h-3 w-3 mr-1" />
                      {formattedDate}
                    </AnimatedRecentAudioComponents.CardDate>
                    <AnimatedRecentAudioComponents.ViewButton index={index}>
                      <Button size="sm" asChild>
                        <Link href={`/result/${audio.url.split("/").pop()}`}>
                          View Results
                        </Link>
                      </Button>
                    </AnimatedRecentAudioComponents.ViewButton>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>
    </section>
  );
}
