"use server";

import type { AnalysisResult } from "@/components/results-content";

/**
 * Server action for generating PDF from analysis
 * @param result Analysis results to convert to PDF
 * @returns Response with PDF blob
 */
export async function generatePdf(result: AnalysisResult): Promise<Response> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    return response;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error("Failed to generate PDF");
  }
} 