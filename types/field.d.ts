export type FieldType = "text" | "date" | "signature" | "checkbox";

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  position: number;
  required?: boolean;
  // PDF spatial properties (for PDF-based blueprints)
  pageNumber?: number; // Page number (1-indexed)
  x?: number; // X coordinate (percentage 0-100)
  y?: number; // Y coordinate (percentage 0-100)
  width?: number; // Width (percentage 0-100)
  height?: number; // Height (percentage 0-100)
}

