// Declaration for pdfkit
declare module 'pdfkit' {
  interface PDFDocumentOptions {
    margin?: number;
    size?: string; 
    font?: string | null;
    [key: string]: unknown; // For other options we don't list
  }

  interface TextOptions {
    align?: 'left' | 'center' | 'right' | 'justify';
    underline?: boolean;
    [key: string]: unknown; // For other options
  }

  export default class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    fontSize(size: number): PDFDocument;
    text(text: string, options?: TextOptions): PDFDocument;
    moveDown(lines?: number): PDFDocument;
    on(event: string, callback: (chunk: Uint8Array) => void): void;
    end(): void;
  }
}