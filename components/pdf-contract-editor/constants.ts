import type { PDFTypographyConfig } from "../../types/pdf";

export type { PDFTypographyConfig } from "../../types/pdf";

export const DEFAULT_PDF_TYPOGRAPHY: PDFTypographyConfig = {
  fontFamily: "Times, 'Times New Roman', serif",
  fontFallback: "Georgia, serif",
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 400,
  fontStyle: "normal",
  letterSpacing: "normal",
  textColor: "#000000",
  paragraphSpacing: 0,
  lineSpacing: 0,
  lineHeightPx: 0,
  pageWidth: 0,
  pageHeight: 0,
  leftMargin: 72,
  rightMargin: 72,
  topMargin: 72,
  bottomMargin: 72,
  contentWidth: 0,
};

export const PDF_FIELD_STYLES = `
  .pdf-field {
    position: absolute;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #2563eb;
    border-radius: 4px;
    padding: 4px 6px;
    box-sizing: border-box;
    font-size: 12px;
    line-height: 1.2;
    overflow: hidden;
    color: #000000;
    font-family: Times, 'Times New Roman', serif, Georgia, serif;
    font-weight: 400;
    letter-spacing: normal;
  }

  .pdf-field.read-only {
    white-space: pre-wrap;
    word-break: break-word;
    overflow: hidden;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
  }
`;
