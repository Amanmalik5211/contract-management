import type { Field } from "./field";

export interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

export interface PdfViewerProps {
  pdfUrl: string;
  className?: string;
  onPageRefsReady?: (refs: Map<number, HTMLDivElement | null>) => void;
  onPageRender?: (pageNum: number, element: HTMLDivElement | null) => void;
}

export type PdfDocument = {
  numPages: number;
  getPage: (pageNum: number) => Promise<unknown>;
};

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

export interface GenerateContractPdfParams {
  pdfUrl: string;
  fields: Field[];
  fieldValues: Record<string, string | boolean | Date | null>;
}

export interface DownloadWarnings {
  overlappingFieldLabels: string[];
  unfilledFieldLabels: string[];
  fieldsOverlappingPdfTextLabels: string[];
}

