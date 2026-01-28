"use client";

import { useRef } from "react";
import type { Field } from "@/types/field";
import { AlertTriangle } from "lucide-react";
import { DEFAULT_PDF_TYPOGRAPHY, PDFTypographyConfig } from "./constants";
import { validateTextFits, calculateLineHeightPx } from "./validation";

interface EditableTextFieldProps {
  field: Field;
  value: string;
  pageWidth: number;
  pageHeight: number;
  left: number;
  top: number;
  width: number;
  height: number;
  hasOverflow: boolean;
  onValueChange: (value: string) => void;
  onOverflowChange: (hasOverflow: boolean) => void;
  textareaRef: (el: HTMLTextAreaElement | null) => void;
}

export function EditableTextField({
  field,
  value,
  pageWidth,
  pageHeight,
  left,
  top,
  width,
  height,
  hasOverflow,
  onValueChange,
  onOverflowChange,
  textareaRef,
}: EditableTextFieldProps) {
  const typography: PDFTypographyConfig = {
    ...DEFAULT_PDF_TYPOGRAPHY,
  };
  typography.lineHeightPx = calculateLineHeightPx(typography.fontSize, typography.lineHeight);

  const measureTextFitsInField = (text: string, fieldWidth: number, fieldHeight: number) => {
    const padding = 8;
    const result = validateTextFits(text, fieldHeight, fieldWidth, typography, padding);
    return { isValid: result.isValid, wouldExceed: result.wouldExceed };
  };

  return (
    <div
      key={field.id}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 10 + (field.position ?? 0),
        boxSizing: "border-box",
        pointerEvents: "auto",
      }}
      className="z-10"
    >
      <textarea
        ref={textareaRef}
        value={value || ""}
        onChange={(e) => {
          const nextValue = e.target.value;
          const { isValid, wouldExceed } = measureTextFitsInField(nextValue, width, height);
          if (wouldExceed) {
            onOverflowChange(true);
            const ta = e.target;
            setTimeout(() => { ta.value = value || ""; }, 0);
            return;
          }
          onValueChange(nextValue);
          onOverflowChange(false);
        }}
        onKeyDown={(e) => {
          if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
          const currentValue = value || "";
          const textarea = e.currentTarget;
          const cursorPos = textarea.selectionStart ?? 0;
          const nextValue = currentValue.slice(0, cursorPos) + e.key + currentValue.slice(textarea.selectionEnd ?? cursorPos);
          const { isValid } = measureTextFitsInField(nextValue, width, height);
          if (!isValid) {
            e.preventDefault();
            onOverflowChange(true);
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const pasteText = e.clipboardData.getData("text");
          const currentValue = value || "";
          const textarea = e.currentTarget;
          const cursorPos = textarea.selectionStart ?? 0;
          const nextValue = currentValue.slice(0, cursorPos) + pasteText + currentValue.slice(textarea.selectionEnd ?? cursorPos);
          const { wouldExceed } = measureTextFitsInField(nextValue, width, height);
          if (wouldExceed) {
            onOverflowChange(true);
            return;
          }
          onValueChange(nextValue);
          onOverflowChange(false);
          setTimeout(() => {
            textarea.setSelectionRange(cursorPos + pasteText.length, cursorPos + pasteText.length);
          }, 0);
        }}
        placeholder={field.label}
        className={`w-full h-full rounded-md border-2 ${
          hasOverflow 
            ? "border-red-500 focus:border-red-600 focus:ring-red-500" 
            : "border-blue-500 focus:ring-blue-500"
        } bg-gray-600 dark:bg-gray-700 text-white placeholder-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 resize-none touch-manipulation`}
        style={{ 
          width: "100%",
          height: "100%",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          overflow: "hidden",
          boxSizing: "border-box",
          fontFamily: typography.fontFamily,
          fontSize: `clamp(7px, 0.9vw, ${typography.fontSize}px)`,
          lineHeight: 1.2,
          fontWeight: typography.fontWeight,
          minHeight: "32px",
        }}
      />
      {hasOverflow && (() => {
        const warningMaxWidth = Math.min(280, Math.max(180, pageWidth - left - 12));
        const showAbove = top >= 48;
        return (
          <div
            className="absolute left-0 bg-red-600 text-white text-[10px] sm:text-xs px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-md shadow-lg z-30 flex items-start gap-1.5 sm:gap-2 pointer-events-auto"
            style={{
              maxWidth: `min(${warningMaxWidth}px, calc(100vw - 2rem))`,
              ...(showAbove
                ? { bottom: "100%", marginBottom: 4 }
                : { top: "100%", marginTop: 4 }),
            }}
          >
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" aria-hidden />
            <span className="whitespace-normal break-words leading-snug">
              Text exceeds the available space for this field.
            </span>
          </div>
        );
      })()}
    </div>
  );
}

