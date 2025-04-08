import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: NextRequest) {
  try {
    const { title, summary, keyPoints, discussionQuestions } = await req.json();

    if (!summary) {
      return NextResponse.json(
        { error: "Brak wymaganych danych do wygenerowania PDF" },
        { status: 400 }
      );
    }

    // Tworzenie dokumentu PDF
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      // Wyłączamy automatyczne ładowanie czcionek
      font: null
    });

    // Bufor na dane
    const buffers: Uint8Array[] = [];
    doc.on('data', (chunk: Uint8Array) => buffers.push(chunk));

    // Obietnica zakończenia generowania
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });

    // Formatowanie dokumentu
    // Tytuł
    doc.fontSize(20).text('Analiza filmu YouTube', { align: 'center' });
    doc.moveDown();
    
    if (title) {
      doc.fontSize(16).text('Tytuł filmu:', { underline: true });
      doc.fontSize(14).text(title);
      doc.moveDown();
    }

    // Streszczenie
    doc.fontSize(16).text('Streszczenie:', { underline: true });
    doc.fontSize(12).text(summary);
    doc.moveDown(2);

    // Najważniejsze punkty
    if (keyPoints && keyPoints.length > 0) {
      doc.fontSize(16).text('Najważniejsze punkty:', { underline: true });
      doc.fontSize(12);
      keyPoints.forEach((point: string, index: number) => {
        doc.text(`${index + 1}. ${point}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Pytania do dyskusji
    if (discussionQuestions && discussionQuestions.length > 0) {
      doc.fontSize(16).text('Pytania do dyskusji:', { underline: true });
      doc.fontSize(12);
      discussionQuestions.forEach((question: string, index: number) => {
        doc.text(`${index + 1}. ${question}`);
        doc.moveDown(0.5);
      });
    }

    // Stopka
    doc.moveDown(2);
    const date = new Date().toLocaleDateString('pl-PL');
    doc.fontSize(10).text(`Wygenerowano: ${date}`, { align: 'center' });

    // Zakończ dokument
    doc.end();

    // Poczekaj na zakończenie generowania
    const pdfBuffer = await pdfPromise;

    // Zwróć PDF jako odpowiedź
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analiza-filmu.pdf"`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Błąd podczas generowania PDF:", errorMessage);
    return NextResponse.json(
      { error: `Błąd podczas generowania PDF: ${errorMessage}` },
      { status: 500 }
    );
  }
} 