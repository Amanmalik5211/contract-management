import type { Field } from "./field";

export type ContractStatus = 
  | "created" 
  | "approved" 
  | "sent" 
  | "signed" 
  | "locked" 
  | "revoked";

export type ContractStatusGroup = "active" | "pending" | "signed";

export interface Contract {
  id: string;
  name: string;
  blueprintId: string;
  blueprintName: string;
  status: ContractStatus;
  fields: Field[];
  fieldValues: Record<string, string | boolean | Date | null>;
  // PDF metadata (for PDF-based contracts)
  pdfUrl?: string;
  pageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

