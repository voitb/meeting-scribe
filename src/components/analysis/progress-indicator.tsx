import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckIcon, AlertTriangle } from "lucide-react";
import type { AnalysisStep } from "@/types/analysis";
import type { AnalysisStatus } from "@/types/analysis";

interface ProgressIndicatorProps {
  steps: AnalysisStep[];
  currentStep: number;
  analysisStatus: AnalysisStatus;
}

export function ProgressIndicator({
  steps,
  currentStep,
  analysisStatus,
}: ProgressIndicatorProps) {
  return (
    <Card className="border shadow-md">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center justify-center text-center">
          {analysisStatus === "loading" && (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {steps[currentStep].name}
              </h3>
            </>
          )}

          {analysisStatus === "processing" && (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {steps[currentStep].name}
              </h3>
              <p className="text-muted-foreground mb-2">
                This may take a few minutes
              </p>
            </>
          )}

          {analysisStatus === "completed" && (
            <>
              <CheckIcon className="h-10 w-10 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {steps[currentStep].name}
              </h3>
              <p className="text-muted-foreground mb-2">Preparing results...</p>
            </>
          )}

          {analysisStatus === "error" && (
            <>
              <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Processing Error</h3>
              <p className="text-muted-foreground mb-2">
                An issue occurred during analysis
              </p>
            </>
          )}

          <div className="w-full max-w-md mx-auto mt-4 bg-muted h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                analysisStatus === "error" ? "bg-destructive" : "bg-primary"
              }`}
              style={{
                width: `${analysisStatus === "error" ? 100 : steps[currentStep].progress}%`,
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
