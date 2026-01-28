/**
 * Shared layout constants for contract PDFs so margin and padding are the same
 * in the on-screen preview (pdf-contract-editor) and in the downloaded PDF (generate-contract-pdf).
 * Values are percentages of page dimensions so they scale consistently at any size.
 */

/** Page margin as percentage of page width/height (same on all four sides). ~6% ≈ 36pt on US Letter. */
export const CONTRACT_PAGE_MARGIN_PCT = 6;

/** Inner padding inside each field box as percentage of page width (for text inset). */
export const CONTRACT_FIELD_PADDING_PCT = 0.5;

/**
 * Effective left margin in same units as pageWidth (points or px).
 */
export function contractMarginLeft(pageWidth: number): number {
  return (CONTRACT_PAGE_MARGIN_PCT / 100) * pageWidth;
}

/**
 * Effective right margin edge (x coordinate of content limit).
 */
export function contractMarginRight(pageWidth: number): number {
  return pageWidth - (CONTRACT_PAGE_MARGIN_PCT / 100) * pageWidth;
}

/**
 * Effective top margin in same units as pageHeight (from top = smaller y in screen coords).
 * Returns the inset from top, so content top must be >= this.
 */
export function contractMarginTop(pageHeight: number): number {
  return (CONTRACT_PAGE_MARGIN_PCT / 100) * pageHeight;
}

/**
 * Effective bottom margin (inset from bottom). Content bottom must be <= pageHeight - this.
 */
export function contractMarginBottom(pageHeight: number): number {
  return (CONTRACT_PAGE_MARGIN_PCT / 100) * pageHeight;
}

/**
 * Padding inside field box (horizontal), in same units as page width.
 */
export function contractFieldPaddingX(pageWidth: number): number {
  return Math.max(1, (CONTRACT_FIELD_PADDING_PCT / 100) * pageWidth);
}

/**
 * Padding inside field box (vertical), in same units as page height.
 */
export function contractFieldPaddingY(pageHeight: number): number {
  return Math.max(1, (CONTRACT_FIELD_PADDING_PCT / 100) * pageHeight);
}
