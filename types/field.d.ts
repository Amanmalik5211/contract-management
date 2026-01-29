export type FieldType = "text" | "date" | "signature" | "checkbox";

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  position: number;
  required?: boolean;
  pageNumber?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

