import type { Field } from "./field";

export interface DocumentSection {
  id: string;
  type: "section" | "text" | "field";
  title?: string;
  content?: string;
  fieldId?: string;
  order: number;
}

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  fields: Field[];
  sections: DocumentSection[];
  pdfFileName?: string;
  pdfUrl?: string;
  pageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

