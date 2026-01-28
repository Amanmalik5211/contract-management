import type { Field } from "@/types/field";

export interface FieldValidationResult {
  isValid: boolean;
  wouldExceed: boolean;
  message: string;
}

export interface PDFTypographyConfig {
  fontFamily: string;
  fontFallback: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number | string;
  fontStyle: string;
  letterSpacing: string;
  textColor: string;
  paragraphSpacing: number;
  lineSpacing: number;
  lineHeightPx: number;
  pageWidth: number;
  pageHeight: number;
  leftMargin: number;
  rightMargin: number;
  topMargin: number;
  bottomMargin: number;
  contentWidth: number;
}

export interface PdfContractEditorProps {
  pdfUrl: string;
  fields: Field[];
  fieldValues: Record<string, string | boolean | Date | null>;
  isEditable?: boolean;
  onFieldChange?: (fieldId: string, value: string | boolean) => void;
  onFieldsReorder?: (reorderedFields: Field[]) => void;
  className?: string;
}
