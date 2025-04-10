"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Headphones, FileText, Brain, CheckCircle } from "lucide-react";

interface ProgressCardsProps {
  currentStep: number;
  startTime: number;
}

export function ProgressCards({ currentStep }: ProgressCardsProps) {
  const [showJoke, setShowJoke] = useState(false);

  useEffect(() => {
    // Show joke if first step takes more than 10 seconds
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setShowJoke(true);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setShowJoke(false);
    }
  }, [currentStep]);

  // Step information
  const steps = [
    {
      icon: <Headphones className="h-10 w-10 " />,
      emoji: "🎵",
      title: "Analyzing YouTube",
      description: "Extracting audio from the video for analysis.",
      joke: {
        emoji: "🙄",
        title: "YouTube is being stubborn...",
        description:
          "It seems YouTube is playing hard to get. We're still trying to extract the audio.",
      },
    },
    {
      icon: <FileText className="h-10 w-10 " />,
      emoji: "📝",
      title: "Creating analysis",
      description: "Converting speech to text with advanced AI technology.",
    },
    {
      icon: <Brain className="h-10 w-10 " />,
      emoji: "🧠",
      title: "Analyzing Content",
      description:
        "Identifying key concepts and generating educational materials.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-green-500" />,
      emoji: "✨",
      title: "Analysis Complete!",
      description: "All materials have been successfully generated.",
    },
  ];

  const currentStepInfo = steps[currentStep];
  const displayInfo =
    showJoke && currentStepInfo.joke ? currentStepInfo.joke : currentStepInfo;

  // Animacje dla zawartości karty
  const contentAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${currentStep}-${showJoke ? "joke" : "normal"}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border shadow-md overflow-hidden bg-background/10">
          <CardContent className="p-6">
            <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-center">
              <div>
                <motion.div
                  className="bg-accent/10 rounded-full p-4"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStepInfo.icon}
                </motion.div>
              </div>

              <motion.div
                className="flex-grow"
                variants={contentAnimation}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={itemAnimation}
                  className="flex items-center mb-2"
                >
                  <motion.span
                    className="text-3xl mr-2"
                    initial={{ rotate: -30, scale: 0.5 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    {displayInfo.emoji}
                  </motion.span>
                  <h3 className="text-xl font-semibold text-foreground">
                    {displayInfo.title}
                  </h3>
                </motion.div>
                <motion.p
                  variants={itemAnimation}
                  className="text-muted-foreground"
                >
                  {displayInfo.description}
                </motion.p>
              </motion.div>

              {currentStep < 3 && (
                <div className="flex flex-col space-y-2 ml-4">
                  {[0, 1, 2, 3].map((step) => (
                    <motion.div
                      key={step}
                      className={`h-2 w-2 rounded-full ${
                        step <= currentStep ? "bg-accent" : "bg-muted"
                      }
                      ${step === currentStep ? "bg-foreground" : "bg-muted"}
                      `}
                      animate={{
                        scale: step === currentStep ? [1, 1.5, 1] : 1,
                      }}
                      transition={{
                        repeat:
                          step === currentStep ? Number.POSITIVE_INFINITY : 0,
                        repeatType: "reverse",
                        duration: 1,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
