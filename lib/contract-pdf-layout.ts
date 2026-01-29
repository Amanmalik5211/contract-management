

export const CONTRACT_PAGE_MARGIN_PCT = 6;

export const CONTRACT_FIELD_PADDING_PCT = 0.5;

export function contractMarginLeft(pageWidth: number): number {
  return (CONTRACT_PAGE_MARGIN_PCT / 100) * pageWidth;
}

export function contractMarginRight(pageWidth: number): number {
  return pageWidth - (CONTRACT_PAGE_MARGIN_PCT / 100) * pageWidth;
}

export function contractMarginTop(pageHeight: number): number {
  return (CONTRACT_PAGE_MARGIN_PCT / 100) * pageHeight;
}

export function contractMarginBottom(pageHeight: number): number {
  return (CONTRACT_PAGE_MARGIN_PCT / 100) * pageHeight;
}


export function contractFieldPaddingX(pageWidth: number): number {
  return Math.max(1, (CONTRACT_FIELD_PADDING_PCT / 100) * pageWidth);
}

export function contractFieldPaddingY(pageHeight: number): number {
  return Math.max(1, (CONTRACT_FIELD_PADDING_PCT / 100) * pageHeight);
}
