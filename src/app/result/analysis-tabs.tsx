import ResultsTabs from "@/components/results";
import type { AnalysisResult } from "@/components/results-content";

interface AnalysisTabsProps {
  result: AnalysisResult;
  skipSummary?: boolean;
}

/**
 * Server component for displaying analysis tabs
 */
export default function AnalysisTabs({
  result,
  skipSummary,
}: AnalysisTabsProps) {
  return <ResultsTabs result={result} skipSummary={skipSummary} />;
}
