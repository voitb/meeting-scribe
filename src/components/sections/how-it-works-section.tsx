"use client";

import { BookOpen, Music, ListTodo, LightbulbIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const featureItems = [
  {
    icon: <Music className="h-8 w-8 text-primary" />,
    title: "Upload Audio File",
    description: "Upload any audio file in mp3, wav, ogg or similar format.",
  },
  {
    icon: <ListTodo className="h-8 w-8 text-primary" />,
    title: "Audio Analysis",
    description:
      "The system automatically analyzes the audio content using advanced AI technology.",
  },
  {
    icon: <LightbulbIcon className="h-8 w-8 text-primary" />,
    title: "Content Extraction",
    description:
      "Advanced artificial intelligence extracts key information and insights from the audio.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: "Educational Materials",
    description:
      "Based on the analysis, educational materials such as summaries, notes, and glossaries are created.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our application uses artificial intelligence to process audio
          recordings and create high-quality educational materials.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {featureItems.map((item, index) => (
          <Card
            key={index}
            className="border hover:border-primary/50 transition-colors"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
