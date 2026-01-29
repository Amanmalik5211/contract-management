import type { Field } from "./field";

export interface DocumentSection {
  id: string;
  type: "section" | "text" | "field";
  title?: string;
  content?: string;
  fieldId?: string; // For field type sections
  order: number;
}

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  fields: Field[];
  sections: DocumentSection[]; // Document structure
  // PDF template support
  pdfFileName?: string; // Name of the PDF file
  pdfUrl?: string; // Object URL or base64 encoded PDF
  pageCount?: number; // Number of pages in the PDF
  createdAt: Date;
  updatedAt: Date;
}

