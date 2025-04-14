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

// Types
interface AnimatedProgressCardsProps {
  currentStep: number;
  progress: number;
  steps: string[];
}

interface StepInfo {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  description: string;
}

// Step information
const STEP_INFO: StepInfo[] = [
  {
    icon: <Headphones className="h-10 w-10" />,
    emoji: "🎵",
    title: "Downloading audio",
    description: "Extracting audio from YouTube video for analysis.",
  },
  {
    icon: <FileText className="h-10 w-10" />,
    emoji: "📝",
    title: "Creating transcription",
    description: "Converting speech to text using advanced AI technology.",
  },
  {
    icon: <Brain className="h-10 w-10" />,
    emoji: "🧠",
    title: "Analyzing content",
    description:
      "Identifying key concepts, summarizing content and generating educational materials.",
  },
  {
    icon: <CheckCircle className="h-10 w-10" />,
    emoji: "✨",
    title: "Finalizing results",
    description:
      "Organizing all materials into a comprehensive educational package.",
  },
];

// Animation variants
const CARD_VARIANTS = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95, zIndex: 0 },
};

const BADGE_VARIANTS = {
  initial: { scale: 0 },
  animate: { scale: 1 },
};

const EMOJI_VARIANTS = {
  initial: { scale: 0 },
  animate: { scale: 1 },
};

// Hook for progress color
function useProgressColor(progress: number) {
  const [progressColor, setProgressColor] = useState("bg-accent");

  useEffect(() => {
    if (progress < 30) {
      setProgressColor("bg-accent");
    } else if (progress < 70) {
      setProgressColor("bg-accent");
    } else {
      setProgressColor("bg-accent");
    }
  }, [progress]);

  return progressColor;
}

export function AnimatedProgressCards({
  currentStep,
  progress,
  steps,
}: AnimatedProgressCardsProps) {
  const progressColor = useProgressColor(progress);

  return (
    <div className="relative">
      <ProgressBar progress={progress} progressColor={progressColor} />
      <StepCard
        currentStep={currentStep}
        stepInfo={STEP_INFO[currentStep]}
        currentStepText={steps[currentStep]}
      />
      <StepIndicators steps={steps} currentStep={currentStep} />
    </div>
  );
}

function ProgressBar({
  progress,
  progressColor,
}: {
  progress: number;
  progressColor: string;
}) {
  return (
    <div className="mb-6">
      <Progress value={progress} className={`h-2 ${progressColor}`} />
      <p className="text-center text-sm text-muted-foreground mt-2">
        {Math.round(progress)}% Complete
      </p>
    </div>
  );
}

interface StepCardProps {
  currentStep: number;
  stepInfo: StepInfo;
  currentStepText: string;
}

function StepCard({ currentStep, stepInfo, currentStepText }: StepCardProps) {
  return (
    <div className="relative h-[200px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={CARD_VARIANTS}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Card className="border shadow-md overflow-hidden h-full">
            <CardContent className="p-6 flex items-center h-full">
              <StepIcon icon={stepInfo.icon} currentStep={currentStep} />
              <StepContent
                title={stepInfo.title}
                description={stepInfo.description}
                emoji={stepInfo.emoji}
                currentStepText={currentStepText}
              />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepIcon({
  icon,
  currentStep,
}: {
  icon: React.ReactNode;
  currentStep: number;
}) {
  return (
    <div className="mr-6 flex-shrink-0">
      <div className="bg-accent/10 rounded-full p-4 relative">
        {icon}
        <motion.div
          variants={BADGE_VARIANTS}
          transition={{ delay: 0.2, duration: 0.3, type: "spring" }}
          className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
        >
          {currentStep + 1}
        </motion.div>
      </div>
    </div>
  );
}

interface StepContentProps {
  title: string;
  description: string;
  emoji: string;
  currentStepText: string;
}

function StepContent({
  title,
  description,
  emoji,
  currentStepText,
}: StepContentProps) {
  return (
    <div className="flex-grow">
      <div className="flex items-center mb-2">
        <motion.span
          variants={EMOJI_VARIANTS}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-2xl mr-2"
        >
          {emoji}
        </motion.span>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">{currentStepText}</span>
      </div>
    </div>
  );
}

function StepIndicators({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
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
  );
}
