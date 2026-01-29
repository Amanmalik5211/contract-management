"use client";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";
import type { Field } from "@/types/field";
import type { GenerateContractPdfParams, DownloadWarnings } from "@/types/pdf";
import { findFieldsOverlappingPdfText } from "@/lib/pdf-text-overlap";
import {
  contractMarginLeft,
  contractMarginRight,
  contractMarginBottom,
  contractMarginTop,
  contractFieldPaddingX,
  contractFieldPaddingY,
} from "@/lib/contract-pdf-layout";

const DEFAULT_FONT_SIZE = 12;
const LINE_HEIGHT_RATIO = 1.2;

/**
 * Wrap text into lines that fit within maxWidthPt when rendered at fontSize.
 * Uses font.widthOfTextAtSize for measuring. Breaks on spaces when possible.
 */
function wrapTextToLines(
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  text: string,
  fontSize: number,
  maxWidthPt: number
): string[] {
  if (maxWidthPt <= 0) return [text];
  const lines: string[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const trial = currentLine ? `${currentLine} ${word}` : word;
    const w = font.widthOfTextAtSize(trial, fontSize);
    if (w <= maxWidthPt) {
      currentLine = trial;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word longer than line: break by character
        let chunk = "";
        for (const c of word) {
          const next = chunk + c;
          if (font.widthOfTextAtSize(next, fontSize) <= maxWidthPt) {
            chunk = next;
          } else {
            if (chunk) lines.push(chunk);
            chunk = c;
          }
        }
        currentLine = chunk;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function formatFieldValue(
  value: string | boolean | Date | null | undefined,
  _fieldType: Field["type"]
): string {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "Yes" : "";
  if (value instanceof Date) return format(value, "yyyy-MM-dd");
  return String(value);
}

async function getPdfBytes(pdfUrl: string): Promise<Uint8Array> {
  if (pdfUrl.startsWith("data:")) {
    const base64 = pdfUrl.split(",")[1];
    if (!base64) throw new Error("Invalid data URL");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  const res = await fetch(pdfUrl);
  if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

/** Returns true if two fields overlap on the same page (bounding boxes intersect). */
function doFieldsOverlap(a: Field, b: Field): boolean {
  if (a.id === b.id) return false;
  if (a.pageNumber !== b.pageNumber) return false;
  if (a.x == null || a.y == null || a.width == null || a.height == null) return false;
  if (b.x == null || b.y == null || b.width == null || b.height == null) return false;
  const aR = a.x + a.width;
  const aB = a.y + a.height;
  const bR = b.x + b.width;
  const bB = b.y + b.height;
  const t = 0.5;
  return !(aR <= b.x + t || bR <= a.x + t || aB <= b.y + t || bB <= a.y + t);
}

/** Value is considered filled if it would produce non-empty text in the PDF (same rule as formatFieldValue). */
function isFilled(value: string | boolean | Date | null | undefined, _fieldType: Field["type"]): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value; // checkbox: checked = filled, unchecked = unfilled
  if (value instanceof Date) return true;
  return String(value).trim() !== "";
}


/**
 * Returns labels of fields that overlap (and may not display correctly on the downloaded PDF)
 * and of fields that are unfilled. Use before download to show warnings.
 * 
 * @param pdfUrl - URL of the PDF to check for text overlaps (optional, only needed for PDF text overlap detection)
 * @param pdfjsLib - PDF.js library instance (optional, only needed for PDF text overlap detection)
 */
export async function getDownloadWarnings(
  fields: Field[],
  fieldValues: Record<string, string | boolean | Date | null>,
  pdfUrl?: string,
  pdfjsLib?: any
): Promise<DownloadWarnings> {
  const overlappingIds = new Set<string>();
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      if (doFieldsOverlap(fields[i], fields[j])) {
        overlappingIds.add(fields[i].id);
        overlappingIds.add(fields[j].id);
      }
    }
  }
  const overlappingFieldLabels = fields.filter((f) => overlappingIds.has(f.id)).map((f) => f.label);
  const unfilledFieldLabels = fields.filter(
    (f) => !isFilled(fieldValues[f.id], f.type)
  ).map((f) => f.label);

  // Check for fields overlapping PDF text if pdfUrl and pdfjsLib are provided
  let fieldsOverlappingPdfTextLabels: string[] = [];
  if (pdfUrl && pdfjsLib) {
    try {
      const overlappingPdfTextIds = await findFieldsOverlappingPdfText(pdfUrl, fields, pdfjsLib);
      fieldsOverlappingPdfTextLabels = fields
        .filter((f) => overlappingPdfTextIds.has(f.id))
        .map((f) => f.label);
    } catch (error) {
      console.warn("Failed to check PDF text overlaps:", error);
      // Continue without PDF text overlap detection
    }
  }

  return { overlappingFieldLabels, unfilledFieldLabels, fieldsOverlappingPdfTextLabels };
}

/**
 * Generates a complete, flattened PDF from the original template and filled field values.
 * All pages are preserved in order; all field values are drawn as static text.
 * Returns PDF bytes ready for download. Throws on failure.
 */
export async function generateContractPdf({
  pdfUrl,
  fields,
  fieldValues,
  skipOverlappingPdfText = true,
  pdfjsLib,
}: GenerateContractPdfParams & { skipOverlappingPdfText?: boolean; pdfjsLib?: any }): Promise<Uint8Array> {
  const pdfBytes = await getPdfBytes(pdfUrl);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  if (pages.length === 0) {
    throw new Error("PDF has no pages");
  }

  // Pre-compute which fields overlap with PDF text (if detection is enabled)
  let fieldsOverlappingPdfText: Set<string> = new Set();
  if (skipOverlappingPdfText && pdfjsLib) {
    try {
      fieldsOverlappingPdfText = await findFieldsOverlappingPdfText(pdfUrl, fields, pdfjsLib);
    } catch (error) {
      console.warn("Failed to check PDF text overlaps during generation:", error);
      // Continue without skipping overlapping text
    }
  }

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const pageNum = i + 1;
    const fieldsOnPage = fields.filter((f) => f.pageNumber === pageNum);

    for (const field of fieldsOnPage) {
      if (field.x === undefined || field.y === undefined) continue;

      // Skip drawing field text if it overlaps with PDF text
      if (skipOverlappingPdfText && fieldsOverlappingPdfText.has(field.id)) {
        continue;
      }

      const value = fieldValues[field.id];
      const displayText = formatFieldValue(value, field.type);
      if (displayText === "") continue;

      // Field box in page coordinates (percent → points). PDF y is bottom-up.
      const widthPct = field.width ?? 20;
      const heightPct = field.height ?? 5;
      let leftPt = (field.x / 100) * pageWidth;
      let widthPt = (widthPct / 100) * pageWidth;
      const heightPt = (heightPct / 100) * pageHeight;
      let topOfBoxPt = pageHeight - (field.y / 100) * pageHeight;
      let bottomOfBoxPt = pageHeight - ((field.y + heightPct) / 100) * pageHeight;

      // Clamp to shared page margins so text stays within PDF margins (same as preview)
      const marginL = contractMarginLeft(pageWidth);
      const marginR = contractMarginRight(pageWidth);
      const marginB = contractMarginBottom(pageHeight);
      const marginT = pageHeight - contractMarginTop(pageHeight);
      leftPt = Math.max(marginL, Math.min(leftPt, marginR - 1));
      const rightPt = Math.min(marginR, leftPt + widthPt);
      widthPt = Math.max(0, rightPt - leftPt);
      bottomOfBoxPt = Math.max(marginB, Math.min(bottomOfBoxPt, marginT - 1));
      topOfBoxPt = Math.min(marginT, Math.max(topOfBoxPt, bottomOfBoxPt + 1));
      const heightPtClamped = Math.max(0, topOfBoxPt - bottomOfBoxPt);

      const paddingX = contractFieldPaddingX(pageWidth);
      const paddingY = contractFieldPaddingY(pageHeight);

      const minFontSize = 6;
      let fontSize = DEFAULT_FONT_SIZE;
      let linesToDraw: string[] = [];

      // Auto-scale font size to fit text in box
      for (let size = DEFAULT_FONT_SIZE; size >= minFontSize; size--) {
        const lineHeight = size * LINE_HEIGHT_RATIO;
        const availableHeight = heightPtClamped - 2 * paddingY;
        // Ensure at least 1 line is allowed if height is small
        const currentMaxLines = Math.max(1, Math.floor(availableHeight / lineHeight));
        const currentMaxWidth = Math.max(1, widthPt - 2 * paddingX);

        const wrapped = wrapTextToLines(font, displayText, size, currentMaxWidth);

        // If it fits, or if we are at the minimum size (take what we can get)
        if (wrapped.length <= currentMaxLines || size === minFontSize) {
          fontSize = size;
          // If it still doesn't fit at min size, we unfortunately have to truncate
          linesToDraw = wrapped.slice(0, currentMaxLines);
          break;
        }
      }

      const lineHeightPt = fontSize * LINE_HEIGHT_RATIO;

      // Draw from top of box downward (PDF y decreases)
      // pdf-lib drawText y coordinate is the baseline. 
      // Cap height approximation: usually font size is close to cap height.
      // We align to top padding.
      const firstBaselineY = topOfBoxPt - paddingY - fontSize + (fontSize * 0.2); // adjusting baseline slightly up
      const xPt = leftPt + paddingX;

      const textColor = rgb(0, 0, 0);
      for (let L = 0; L < linesToDraw.length; L++) {
        const yPt = firstBaselineY - L * lineHeightPt;
        // Check bounds (redundant if maxLines logic is correct, but safe)
        if (L > 0 && yPt < bottomOfBoxPt) break;

        // Safety check for empty lines
        if (!linesToDraw[L]) continue;

        page.drawText(linesToDraw[L], {
          x: xPt,
          y: yPt,
          size: fontSize,
          font,
          color: textColor,
        });
      }
    }
  }

  return pdfDoc.save();
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Sanitizes a string for use in a filename (alphanumeric, hyphens, underscores).
 */
export function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").slice(0, 80) || "contract";
}
