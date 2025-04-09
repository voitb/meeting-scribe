import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

async function generatePDFBuffer(title: string, summary: string, keyPoints: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Uint8Array<ArrayBufferLike>[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc
        .fontSize(20)
        .text(title, { underline: true });

      doc.moveDown();

      doc
        .fontSize(14)
        .text('Summary:', { underline: true });
      doc
        .fontSize(12)
        .text(summary);

      doc.moveDown();

      doc
        .fontSize(14)
        .text('Key Points:', { underline: true });

      doc.moveDown();

      keyPoints.forEach((point) => {
        doc.fontSize(12).text(`•  ${point}`);
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, summary, keyPoints } = await req.json();

    const pdfBuffer = await generatePDFBuffer(title, summary, keyPoints);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="video-analysis.pdf"',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error generating PDF:", errorMessage);
    return NextResponse.json(
      { error: `Error generating PDF: ${errorMessage}` },
      { status: 500 }
    );
  }
}