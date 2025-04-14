"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { AnalysisResult } from "@/types/analysis";

interface DownloadPdfButtonProps {
  result: AnalysisResult;
}

export function DownloadPdfButton({ result }: DownloadPdfButtonProps) {
  const handleDownloadPdf = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `meeting-scribe-${result.title}-${Date.now()}.pdf`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF file has been generated");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Error generating PDF");
    }
  };

  return (
    <Button
      onClick={handleDownloadPdf}
      size="sm"
      className="sm:ml-4 shrink-0 w-auto"
    >
      <Download className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span className="text-xs sm:text-sm">Download PDF</span>
    </Button>
  );
}
