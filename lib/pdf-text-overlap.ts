"use client";

import type { Field } from "@/types/field";
import type { PdfTextItem } from "@/types/pdf";

/**
 * Check which fields overlap with PDF text content.
 * Returns a Set of field IDs that overlap.
 *
 * This implementation is optimized to:
 * - Load the PDF document only once per call
 * - Extract text for each page only once
 * - Check all fields on a page against the same set of text boxes
 *
 * This makes warnings appear much faster compared to checking each field
 * with its own PDF load/text extraction.
 */
export async function findFieldsOverlappingPdfText(
  pdfUrl: string,
  fields: Field[],
  pdfjsLib: any
): Promise<Set<string>> {
  const overlappingIds = new Set<string>();

  // Group fields by page so we only parse each page once
  const fieldsByPage = new Map<number, Field[]>();
  for (const field of fields) {
    if (
      !field.pageNumber ||
      field.x === undefined ||
      field.y === undefined
    ) {
      continue;
    }
    const pageNum = field.pageNumber;
    if (!fieldsByPage.has(pageNum)) {
      fieldsByPage.set(pageNum, []);
    }
    fieldsByPage.get(pageNum)!.push(field);
  }

  if (fieldsByPage.size === 0) {
    return overlappingIds;
  }

  try {
    // Load PDF document once
    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
    const pdf = await loadingTask.promise;

    const pageChecks: Promise<void>[] = [];

    for (const [pageNum, pageFields] of fieldsByPage.entries()) {
      pageChecks.push(
        (async () => {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.0 });
          const { width: pageWidth, height: pageHeight } = viewport;

          // Extract text content once for this page
          const textContent = await page.getTextContent();

          // Pre-compute text bounding boxes
          const textBoxes = (textContent.items as PdfTextItem[])
            .filter(
              (item) =>
                item.str &&
                item.str.trim().length > 0 &&
                item.transform &&
                item.transform.length >= 6
            )
            .map((item) => {
              const textX = item.transform[4]; // e
              const textY = pageHeight - item.transform[5]; // f (flip because PDF y is bottom-up)
              const textWidth = item.width || 0;
              const textHeight = item.height || 0;

              const left = textX;
              const right = textX + textWidth;
              const top = textY;
              const bottom = textY - textHeight; // y decreases upward in our coordinate system

              return { left, right, top, bottom };
            });

          if (textBoxes.length === 0) return;

          const threshold = 2; // pixels

          // For each field on this page, check against all text boxes
          for (const field of pageFields) {
            const fieldLeft = (field.x! / 100) * pageWidth;
            const fieldTop = (field.y! / 100) * pageHeight;
            const fieldWidth = ((field.width ?? 20) / 100) * pageWidth;
            const fieldHeight = ((field.height ?? 5) / 100) * pageHeight;
            const fieldRight = fieldLeft + fieldWidth;
            const fieldBottom = fieldTop + fieldHeight;

            const overlaps = textBoxes.some((tb) => {
              return !(
                fieldRight <= tb.left - threshold ||
                fieldLeft >= tb.right + threshold ||
                fieldBottom <= tb.top - threshold ||
                fieldTop >= tb.bottom + threshold
              );
            });

            if (overlaps) {
              overlappingIds.add(field.id);
            }
          }
        })()
      );
    }

    await Promise.all(pageChecks);
  } catch (error) {
    console.warn("Failed to check PDF text overlaps:", error);
    // Fail silently, don't block user interaction
  }

  return overlappingIds;
}

