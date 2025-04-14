"use client";

import ResultsTabs from "./results";
import type { AnalysisResult } from "./results-content";

/**
 * @deprecated Use new ResultsTabs component from ./results
 */
export default function DeprecatedResultsTabs({
  result,
  skipSummary = false,
}: {
  result: AnalysisResult;
  skipSummary?: boolean;
}) {
  return <ResultsTabs result={result} skipSummary={skipSummary} />;
}
