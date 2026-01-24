import type { Field } from "./field";

export interface DocumentSection {
  id: string;
  type: "section" | "text" | "image" | "field";
  title?: string;
  content?: string;
  imageUrl?: string;
  imageAlt?: string;
  fieldId?: string; // For field type sections
  order: number;
}

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  fields: Field[];
  sections: DocumentSection[]; // Document structure
  headerImageUrl?: string; // Optional header/logo image
  createdAt: Date;
  updatedAt: Date;
}

