import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

async function generatePDFBuffer(data: {
  title?: string;
  summary: string;
  keyPoints: string[];
  transcription?: string;
  videoChapters?: { startTime: string; endTime: string; title: string; description: string }[];
  presentationQuality?: {
    overallClarity: string;
    difficultSegments: { timeRange: string; issue: string; improvement: string }[];
    improvementSuggestions: string[];
  };
  glossary?: Record<string, string>;
  analysisDate?: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Uint8Array<ArrayBufferLike>[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Title
      if (data.title) {
        doc.fontSize(20).text(data.title, { underline: true });
        doc.moveDown();
      }

      // Analysis Date
      if (data.analysisDate) {
        doc.fontSize(10).text(`Analysis Date: ${data.analysisDate}`, { align: 'right' });
        doc.moveDown();
      }

      // Summary
      doc.fontSize(14).text('Summary:', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(data.summary);
      doc.moveDown(2);

      // Key Points
      doc.fontSize(14).text('Key Points:', { underline: true });
      doc.moveDown();
      data.keyPoints.forEach((point) => {
        doc.fontSize(12).text(`•  ${point}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();

      // Video Chapters
      if (data.videoChapters && data.videoChapters.length > 0) {
        doc.addPage();
        doc.fontSize(14).text('Video Chapters:', { underline: true });
        doc.moveDown();
        
        data.videoChapters.forEach((chapter) => {
          doc.fontSize(12).text(`${chapter.title} (${chapter.startTime} - ${chapter.endTime})`, { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).text(chapter.description);
          doc.moveDown();
        });
        doc.moveDown();
      }

      // Presentation Quality
      if (data.presentationQuality) {
        doc.addPage();
        doc.fontSize(14).text('Presentation Quality Assessment:', { underline: true });
        doc.moveDown();
        
        doc.fontSize(12).text('Overall Clarity:');
        doc.fontSize(11).text(data.presentationQuality.overallClarity);
        doc.moveDown();
        
        if (data.presentationQuality.difficultSegments && data.presentationQuality.difficultSegments.length > 0) {
          doc.fontSize(12).text('Difficult Segments:');
          doc.moveDown(0.5);
          
          data.presentationQuality.difficultSegments.forEach((segment) => {
            doc.fontSize(11).text(`Time: ${segment.timeRange}`);
            doc.fontSize(11).text(`Issue: ${segment.issue}`);
            doc.fontSize(11).text(`Improvement: ${segment.improvement}`);
            doc.moveDown(0.5);
          });
          doc.moveDown();
        }
        
        if (data.presentationQuality.improvementSuggestions && data.presentationQuality.improvementSuggestions.length > 0) {
          doc.fontSize(12).text('Improvement Suggestions:');
          doc.moveDown(0.5);
          
          data.presentationQuality.improvementSuggestions.forEach((suggestion) => {
            doc.fontSize(11).text(`•  ${suggestion}`);
            doc.moveDown(0.5);
          });
        }
        doc.moveDown();
      }

      // Glossary
      if (data.glossary && Object.keys(data.glossary).length > 0) {
        doc.addPage();
        doc.fontSize(14).text('Glossary of Key Terms:', { underline: true });
        doc.moveDown();
        
        Object.entries(data.glossary).forEach(([term, definition]) => {
          doc.fontSize(12).text(term, { underline: true });
          doc.fontSize(11).text(definition);
          doc.moveDown();
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
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
    return NextResponse.json(
      { error: `Error generating PDF: ${errorMessage}` },
      { status: 500 }
    );
  }
}