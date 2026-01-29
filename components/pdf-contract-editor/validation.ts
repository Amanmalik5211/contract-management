import type { PDFTypographyConfig } from "../../types/pdf";
import type { FieldValidationResult } from "../../types/pdf";

export function calculateLineHeightPx(fontSize: number, lineHeightRatio: number): number {
  return Math.round(fontSize * lineHeightRatio);
}

export function createMeasurementElement(
  width: number,
  typography: PDFTypographyConfig
): HTMLDivElement {
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.visibility = "hidden";
  element.style.height = "auto";
  element.style.width = `${width}px`;
  element.style.fontSize = `${typography.fontSize}px`;
  element.style.lineHeight = `${typography.lineHeight}`;
  element.style.fontFamily = `${typography.fontFamily}, ${typography.fontFallback}`;
  element.style.fontWeight = String(typography.fontWeight);
  element.style.fontStyle = typography.fontStyle;
  element.style.letterSpacing = typography.letterSpacing;
  element.style.color = typography.textColor;
  element.style.whiteSpace = "pre-wrap";
  element.style.wordBreak = "break-word";
  element.style.overflowWrap = "break-word";
  element.style.padding = "0";
  element.style.margin = "0";
  element.style.border = "none";
  element.style.boxSizing = "border-box";
  element.style.top = "-9999px";
  element.style.left = "-9999px";
  document.body.appendChild(element);
  return element;
}

export function validateTextFits(
  text: string,
  fieldHeight: number,
  fieldWidth: number,
  typography: PDFTypographyConfig,
  padding: number = 0
): FieldValidationResult {
  if (!text || text.trim() === "") {
    return { isValid: true, wouldExceed: false, message: "" };
  }

  const availableHeight = Math.max(1, fieldHeight - padding);
  if (availableHeight <= 0) {
    return {
      isValid: false,
      wouldExceed: true,
      message: "Text exceeds the available space for this field.",
    };
  }

  const measureEl = createMeasurementElement(fieldWidth, typography);

  try {
    measureEl.textContent = text;
    const measuredHeight = measureEl.offsetHeight;
    const fits = measuredHeight <= availableHeight;
    return {
      isValid: fits,
      wouldExceed: !fits,
      message: fits ? "" : "Text exceeds the available space for this field.",
    };
  } finally {
    if (measureEl.parentNode) {
      measureEl.parentNode.removeChild(measureEl);
    }
  }
}
