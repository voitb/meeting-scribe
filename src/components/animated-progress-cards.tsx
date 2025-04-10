"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Headphones,
  FileText,
  Brain,
  CheckCircle,
} from "lucide-react";

interface AnimatedProgressCardsProps {
  currentStep: number;
  progress: number;
  steps: string[];
}

export function AnimatedProgressCards({
  currentStep,
  progress,
  steps,
}: AnimatedProgressCardsProps) {
  const [progressColor, setProgressColor] = useState("bg-accent");

  useEffect(() => {
    // Change progress bar color based on progress
    if (progress < 30) {
      setProgressColor("bg-accent");
    } else if (progress < 70) {
      setProgressColor("bg-accent");
    } else {
      setProgressColor("bg-accent");
    }
  }, [progress]);

  // Step icons and descriptions
  const stepInfo = [
    {
      icon: <Headphones className="h-10 w-10 " />,
      emoji: "🎵",
      title: "Downloading Audio",
      description: "Extracting audio from the YouTube video for analysis.",
    },
    {
      icon: <FileText className="h-10 w-10 " />,
      emoji: "📝",
      title: "Creating Transcription",
      description: "Converting speech to text with advanced AI technology.",
    },
    {
      icon: <Brain className="h-10 w-10 " />,
      emoji: "🧠",
      title: "Analyzing Content",
      description:
        "Identifying key concepts, summarizing content, and generating educational materials.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 " />,
      emoji: "✨",
      title: "Finalizing Results",
      description:
        "Organizing all materials into a comprehensive learning package.",
    },
  ];

  return (
    <div className="relative">
      <div className="mb-6">
        <Progress value={progress} className={`h-2 ${progressColor}`} />
        <p className="text-center text-sm text-muted-foreground mt-2">
          {Math.round(progress)}% Complete
        </p>
      </div>

      <div className="relative h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, zIndex: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Card className="border shadow-md overflow-hidden h-full">
              <CardContent className="p-6 flex items-center h-full">
                <div className="mr-6 flex-shrink-0">
                  <div className="bg-accent/10 rounded-full p-4 relative">
                    {stepInfo[currentStep].icon}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3, type: "spring" }}
                      className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                    >
                      {currentStep + 1}
                    </motion.div>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="text-2xl mr-2"
                    >
                      {stepInfo[currentStep].emoji}
                    </motion.span>
                    <h3 className="text-xl font-semibold text-foreground">
                      {stepInfo[currentStep].title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {stepInfo[currentStep].description}
                  </p>
                  <div className="mt-4 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 " />
                    <span className="text-sm text-muted-foreground">
                      {steps[currentStep]}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-6">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index <= currentStep ? "bg-accent" : "bg-muted"
            }`}
            animate={{
              scale: index === currentStep ? [1, 1.3, 1] : 1,
            }}
            transition={{
              repeat: index === currentStep ? Number.POSITIVE_INFINITY : 0,
              repeatType: "reverse",
              duration: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
