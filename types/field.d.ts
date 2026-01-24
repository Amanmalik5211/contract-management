export type FieldType = "text" | "date" | "signature" | "checkbox";

export interface FieldPosition {
  x: number;
  y: number;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  position: FieldPosition;
  required?: boolean;
}

