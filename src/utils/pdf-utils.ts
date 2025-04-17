import PDFDocument from "pdfkit";
import { PDFGenerationData } from "@/types/api";

export async function generatePDFBuffer(
	data: PDFGenerationData
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ size: "A4", margin: 50 });
			const buffers: Uint8Array<ArrayBufferLike>[] = [];

			doc.on("data", (chunk) => buffers.push(chunk));

			doc.on("end", () => {
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
				doc
					.fontSize(10)
					.text(`Analysis Date: ${data.analysisDate}`, { align: "right" });
				doc.moveDown();
			}

			// Summary
			doc.fontSize(14).text("Summary:", { underline: true });
			doc.moveDown();
			doc.fontSize(12).text(data.summary);
			doc.moveDown(2);

			// Key Points
			doc.fontSize(14).text("Key Points:", { underline: true });
			doc.moveDown();
			data.keyPoints.forEach((point) => {
				doc.fontSize(12).text(`•  ${point}`);
				doc.moveDown(0.5);
			});
			doc.moveDown();

			// Video Chapters
			if (data.videoChapters && data.videoChapters.length > 0) {
				doc.fontSize(14).text("Video Chapters:", { underline: true });
				doc.moveDown();

				data.videoChapters.forEach((chapter) => {
					doc
						.fontSize(12)
						.text(
							`${chapter.title} (${chapter.startTime} - ${chapter.endTime})`,
							{ underline: true }
						);
					doc.moveDown(0.5);
					doc.fontSize(11).text(chapter.description);
					doc.moveDown();
				});
				doc.moveDown();
			}

			doc.end();
		} catch (err) {
			reject(err);
		}
	});
}
