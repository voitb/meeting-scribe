import { NextRequest, NextResponse } from "next/server";
import { generatePDFBuffer } from "@/utils/pdf-utils";
import { createErrorResponse } from "@/lib/api-utils";
import { PDFGenerationData } from "@/types/api";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as PDFGenerationData;
    const pdfBuffer = await generatePDFBuffer(data);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="video-analysis.pdf"',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating PDF:", errorMessage);
    return createErrorResponse(`Error generating PDF: ${errorMessage}`, 500);
  }
}