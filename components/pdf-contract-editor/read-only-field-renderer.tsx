"use client";

import type { Field } from "@/types/field";
import { format } from "date-fns";
import { DEFAULT_PDF_TYPOGRAPHY, PDFTypographyConfig } from "./constants";

interface ReadOnlyFieldRendererProps {
  field: Field;
  value: string | boolean | Date | null;
  hasValue: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
}

export function ReadOnlyFieldRenderer({
  field,
  value,
  hasValue,
  left,
  top,
  width,
  height,
}: ReadOnlyFieldRendererProps) {
  const fieldTypography: PDFTypographyConfig = {
    ...DEFAULT_PDF_TYPOGRAPHY,
  };

  switch (field.type) {
    case "text":
      const textValue = hasValue ? (value as string) : "";
      // Use field's percentage values directly for responsive scaling
      const leftPercent = field.x ?? 0;
      const topPercent = field.y ?? 0;
      const widthPercent = field.width ?? 25;
      const heightPercent = field.height ?? 8;
      
      return (
        <div
          key={field.id}
          className="pdf-field read-only"
          style={{
            position: "absolute",
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            width: `${widthPercent}%`,
            height: `${heightPercent}%`,
            zIndex: 10 + (field.position ?? 0),
            boxSizing: "border-box",
            overflow: "hidden",
            fontFamily: fieldTypography.fontFamily,
            // Smaller font size for small screens - no scrollbar
            fontSize: `clamp(6px, 0.9vw, ${fieldTypography.fontSize}px)`,
            lineHeight: 1.2,
            fontWeight: fieldTypography.fontWeight,
            color: fieldTypography.textColor,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            padding: "1px 3px",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <span className="w-full" style={{ lineHeight: "inherit", overflow: "hidden" }}>
            {textValue || "—"}
          </span>
        </div>
      );
    case "date":
      return (
        <div
          key={field.id}
          className="pdf-field read-only"
          style={{
            position: "absolute",
            left: `${field.x ?? 0}%`,
            top: `${field.y ?? 0}%`,
            width: `${field.width ?? 25}%`,
            height: `${field.height ?? 8}%`,
            zIndex: 10 + (field.position ?? 0),
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            fontSize: `clamp(6px, 0.9vw, 11px)`,
            padding: "0 3px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {hasValue
            ? value instanceof Date
                ? format(value, "MMMM d, yyyy")
                : format(new Date(value as string), "MMMM d, yyyy")
            : "—"}
        </div>
      );
    case "checkbox":
      return (
        <div
          key={field.id}
          className="pdf-field read-only"
          style={{
            position: "absolute",
            left: `${field.x ?? 0}%`,
            top: `${field.y ?? 0}%`,
            width: `${field.width ?? 25}%`,
            height: `${field.height ?? 8}%`,
            zIndex: 10 + (field.position ?? 0),
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `clamp(12px, 2vw, 18px)`,
          }}
        >
          {(value as boolean) ? "✓" : "—"}
        </div>
      );
    case "signature":
      return (
        <div
          key={field.id}
          className="pdf-field read-only"
          style={{
            position: "absolute",
            left: `${field.x ?? 0}%`,
            top: `${field.y ?? 0}%`,
            width: `${field.width ?? 25}%`,
            height: `${field.height ?? 8}%`,
            zIndex: 10 + (field.position ?? 0),
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `clamp(6px, 0.9vw, 11px)`,
            overflow: "hidden",
          }}
        >
          {value ? (
            <span style={{ borderBottom: "1px solid #1a1a1a", paddingBottom: "2px" }}>
              [Signed]
            </span>
          ) : "—"}
        </div>
      );
    default:
      return null;
  }
}

