"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { AnalysisStep } from "@/types/analysis";

export interface ProcessingStepsProps {
  steps: AnalysisStep[];
  currentStep: number;
  startTime: number;
  className?: string;
}

export function ProcessingSteps({
  steps,
  currentStep,
  startTime,
  className = "",
}: ProcessingStepsProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentProgress = steps[currentStep]?.progress || 0;

  return (
    <Card className={`border shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium">Analysis Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                {currentProgress}% completed
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>

          <div className="space-y-1">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 py-1 ${
                  index < currentStep
                    ? "text-muted-foreground"
                    : index === currentStep
                      ? "text-primary font-medium"
                      : "text-muted-foreground opacity-50"
                }`}
              >
                {index < currentStep && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {index === currentStep && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
                {index > currentStep && (
                  <div className="h-2 w-2 rounded-full bg-muted" />
                )}
                <span>{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
