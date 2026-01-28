"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { Field } from "@/types/field";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Loader } from "@/components/ui/loader";

import type { PdfContractEditorProps, PDFTypographyConfig } from "./pdf-contract-editor/types";
import { DEFAULT_PDF_TYPOGRAPHY, PDF_FIELD_STYLES } from "./pdf-contract-editor/constants";
import { validateTextFits, calculateLineHeightPx } from "./pdf-contract-editor/validation";
import { getPdfjsLib, yieldToEventLoop } from "./pdf-contract-editor/pdf-utils";
import { ContractPageRow } from "./pdf-contract-editor/contract-page-row";
import { FieldsListPanel } from "@/components/pdf-contract-editor/fields-list-panel";
import { OverflowWarningBanner } from "./pdf-contract-editor/overflow-warning-banner";
import { contractMarginLeft, contractMarginRight, contractMarginTop, contractMarginBottom } from "@/lib/contract-pdf-layout";

export function PdfContractEditor({
  pdfUrl,
  fields,
  fieldValues,
  isEditable = false,
  onFieldChange,
  className = "",
}: PdfContractEditorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pages, setPages] = useState<Array<{ pageNum: number; imageData: string | null; width: number; height: number }>>([]);
  const [renderedDimensions, setRenderedDimensions] = useState<Map<number, { width: number; height: number }>>(new Map());
  const [showFieldsList, setShowFieldsList] = useState(false);
  // STATE-LOCKED overflow warning: only updated in input handlers, never derived from render/effect.
  const [fieldOverflows, setFieldOverflows] = useState<Map<string, boolean>>(new Map());
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement | null>>(new Map());
  const pageRefs = useRef<Map<number, HTMLImageElement | null>>(new Map());
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderingRef = useRef<Set<number>>(new Set());

  // Sort fields by position for consistent ordering (used for list and PDF overlay)
  const orderedFields = [...fields].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  // Group fields by page number
  const fieldsByPage = new Map<number, Field[]>();
  orderedFields.forEach((field) => {
    if (field.pageNumber) {
      const pageNum = field.pageNumber;
      if (!fieldsByPage.has(pageNum)) {
        fieldsByPage.set(pageNum, []);
      }
      fieldsByPage.get(pageNum)!.push(field);
    }
  });

  // Update rendered dimensions when images load
  useEffect(() => {
    if (pages.length === 0) return; // Don't run if no pages loaded yet
    
    const updateDimensions = () => {
      const newDimensions = new Map<number, { width: number; height: number }>();
      pageRefs.current.forEach((img, pageNum) => {
        if (img) {
          newDimensions.set(pageNum, {
            width: img.offsetWidth || img.naturalWidth,
            height: img.offsetHeight || img.naturalHeight,
          });
        }
      });
      setRenderedDimensions(newDimensions);
    };

    // Update on load and resize
    const images = Array.from(pageRefs.current.values()).filter(Boolean) as HTMLImageElement[];
    images.forEach((img) => {
      if (img.complete) {
        updateDimensions();
      } else {
        img.addEventListener("load", updateDimensions);
      }
    });

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", updateDimensions);
      });
      window.removeEventListener("resize", updateDimensions);
    };
  }, [pages]);

  // Render a single page progressively
  const renderPage = async (pdf: PDFDocumentProxy, pageNum: number, scale: number = 1.2) => {
    await yieldToEventLoop();
    
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    await yieldToEventLoop();
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return null;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;
    
    await yieldToEventLoop();
    
    return {
      pageNum,
      imageData: canvas.toDataURL("image/jpeg", 0.85),
      width: viewport.width,
      height: viewport.height,
    };
  };

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        renderingRef.current.clear();

        // Dynamically import pdf.js on client side
        const pdfjsLib = await getPdfjsLib();
        if (!pdfjsLib) {
          setError("PDF.js not available");
          setLoading(false);
          return;
        }

        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        
        // Yield during loading
        await yieldToEventLoop();
        
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        await yieldToEventLoop();

        const totalPages = pdf.numPages;
        setNumPages(totalPages);
        pdfRef.current = pdf;

        // Initialize pages array with placeholders
        const initialPages = Array.from({ length: totalPages }, (_, i) => ({
          pageNum: i + 1,
          imageData: null as string | null,
          width: 0,
          height: 0,
        }));
        setPages(initialPages);

        // Show UI immediately, then render progressively
        setLoading(false);
        
        await yieldToEventLoop();

        // Render pages one at a time
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          if (!isMounted) break;
          
          renderingRef.current.add(pageNum);
          
          const result = await renderPage(pdf, pageNum);
          
          if (result && isMounted) {
            setPages(prev => {
              const newPages = [...prev];
              const pageIndex = newPages.findIndex(p => p.pageNum === result.pageNum);
              if (pageIndex >= 0) {
                newPages[pageIndex] = result;
              }
              return newPages;
            });
          }
          
          renderingRef.current.delete(pageNum);
          
          // Yield after each page
          await yieldToEventLoop();
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      pdfRef.current = null;
    };
  }, [pdfUrl]);

  // Pure measurement: used ONLY inside input handlers. Never in render, effect, or JSX.
  const measureTextFitsInField = useCallback((text: string, fieldWidth: number, fieldHeight: number) => {
    const typography: PDFTypographyConfig = { ...DEFAULT_PDF_TYPOGRAPHY };
    typography.lineHeightPx = calculateLineHeightPx(typography.fontSize, typography.lineHeight);
    const padding = 8;
    const result = validateTextFits(text, fieldHeight, fieldWidth, typography, padding);
    return { isValid: result.isValid, wouldExceed: result.wouldExceed };
  }, []);

  const onPageRef = useCallback((p: number, el: HTMLImageElement | null) => {
    if (el) pageRefs.current.set(p, el);
  }, []);
  const onImageLoad = useCallback((pageNum: number) => {
    const img = pageRefs.current.get(pageNum);
    if (img) {
      setRenderedDimensions((prev) => {
        const m = new Map(prev);
        m.set(pageNum, {
          width: img.offsetWidth || img.naturalWidth,
          height: img.offsetHeight || img.naturalHeight,
        });
        return m;
      });
    }
  }, []);

  // Unified field rendering with fixed dimensions
  const renderField = (field: Field, pageWidth: number, pageHeight: number) => {
    // Don't render if page dimensions are invalid or field position is invalid
    if (!field.pageNumber || field.x === undefined || field.y === undefined || pageWidth <= 0 || pageHeight <= 0) {
      return null;
    }

    // Calculate position with bounds checking - use same margins as downloaded PDF
    const baseLeft = (field.x / 100) * pageWidth;
    const baseTop = (field.y / 100) * pageHeight;
    const baseWidth = field.width ? (field.width / 100) * pageWidth : 200;
    const baseHeight = field.height ? (field.height / 100) * pageHeight : 40;

    const marginLeft = contractMarginLeft(pageWidth);
    const marginRight = contractMarginRight(pageWidth);
    const marginTop = contractMarginTop(pageHeight);
    const marginBottom = contractMarginBottom(pageHeight);
    const rightEdge = marginRight;
    const bottomEdge = pageHeight - marginBottom;

    const left = Math.max(marginLeft, Math.min(baseLeft, rightEdge - baseWidth));
    const top = Math.max(marginTop, Math.min(baseTop, bottomEdge - baseHeight));
    const width = Math.min(baseWidth, rightEdge - left);
    const height = Math.min(baseHeight, bottomEdge - top);

    const value = fieldValues[field.id] ?? "";
    const hasValue = value !== "" && value !== null && value !== false;

    if (isEditable && onFieldChange) {
      switch (field.type) {
        case "text":
          const hasOverflow = fieldOverflows.get(field.id) || false;
          
          // Use default PDF typography (Field type has no typography properties)
          const typography: PDFTypographyConfig = {
            ...DEFAULT_PDF_TYPOGRAPHY,
          };
          typography.lineHeightPx = calculateLineHeightPx(typography.fontSize, typography.lineHeight);
          
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
              }}
              className="z-10"
            >
              <textarea
                ref={(el) => {
                  if (el) textareaRefs.current.set(field.id, el);
                  else textareaRefs.current.delete(field.id);
                }}
                value={(value as string) || ""}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  // Pre-validate: measure nextValue BEFORE any setState. Pure measurement only.
                  const { isValid, wouldExceed } = measureTextFitsInField(nextValue, width, height);
                  if (wouldExceed) {
                    setFieldOverflows((prev) => {
                      const m = new Map(prev);
                      m.set(field.id, true);
                      return m;
                    });
                    const ta = e.target;
                    setTimeout(() => { ta.value = (value as string) || ""; }, 0);
                    return;
                  }
                  onFieldChange(field.id, nextValue);
                  setFieldOverflows((prev) => {
                    const m = new Map(prev);
                    m.delete(field.id);
                    return m;
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
                  const currentValue = (value as string) || "";
                  const textarea = e.currentTarget;
                  const cursorPos = textarea.selectionStart ?? 0;
                  const nextValue = currentValue.slice(0, cursorPos) + e.key + currentValue.slice(textarea.selectionEnd ?? cursorPos);
                  const { isValid } = measureTextFitsInField(nextValue, width, height);
                  if (!isValid) {
                    e.preventDefault();
                    setFieldOverflows((prev) => {
                      const m = new Map(prev);
                      m.set(field.id, true);
                      return m;
                    });
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasteText = e.clipboardData.getData("text");
                  const currentValue = (value as string) || "";
                  const textarea = e.currentTarget;
                  const cursorPos = textarea.selectionStart ?? 0;
                  const nextValue = currentValue.slice(0, cursorPos) + pasteText + currentValue.slice(textarea.selectionEnd ?? cursorPos);
                  const { wouldExceed } = measureTextFitsInField(nextValue, width, height);
                  if (wouldExceed) {
                    setFieldOverflows((prev) => {
                      const m = new Map(prev);
                      m.set(field.id, true);
                      return m;
                    });
                    return;
                  }
                  onFieldChange(field.id, nextValue);
                  setFieldOverflows((prev) => {
                    const m = new Map(prev);
                    m.delete(field.id);
                    return m;
                  });
                  setTimeout(() => {
                    textarea.setSelectionRange(cursorPos + pasteText.length, cursorPos + pasteText.length);
                  }, 0);
                }}
                placeholder={field.label}
                className={`w-full h-full rounded-md border-2 ${
                  hasOverflow 
                    ? "border-red-500 focus:border-red-600 focus:ring-red-500" 
                    : "border-blue-500 focus:ring-blue-500"
                } bg-gray-600 dark:bg-gray-700 text-white placeholder-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none`}
                style={{ 
                  width: "100%",
                  height: "100%",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  overflow: "hidden", // STRICT: No scrollbars
                  boxSizing: "border-box",
                  fontFamily: typography.fontFamily,
                  fontSize: `${typography.fontSize}px`,
                  lineHeight: typography.lineHeight,
                  fontWeight: typography.fontWeight,
                }}
              />
              {/* Warning message when input is blocked - kept within PDF bounds */}
              {hasOverflow && (() => {
                const warningMaxWidth = Math.min(280, Math.max(180, pageWidth - left - 12));
                const showAbove = top >= 48;
                return (
                  <div
                    className="absolute left-0 bg-red-600 text-white text-xs px-2.5 py-2 rounded-md shadow-lg z-30 flex items-start gap-2 pointer-events-auto"
                    style={{
                      maxWidth: `${warningMaxWidth}px`,
                      ...(showAbove
                        ? { bottom: "100%", marginBottom: 6 }
                        : { top: "100%", marginTop: 6 }),
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden />
                    <span className="whitespace-normal break-words leading-snug">
                      Text exceeds the available space for this field.
                    </span>
                  </div>
                );
              })()}
            </div>
          );
        case "date":
          return (
            <div
              key={field.id}
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${Math.max(height, 40)}px`,
                zIndex: 10 + (field.position ?? 0),
              }}
              className="z-10"
            >
              <Input
                type="date"
                value={
                  value instanceof Date
                    ? format(value, "yyyy-MM-dd")
                    : (value as string) || ""
                }
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                className="h-full border-2 border-blue-500 bg-gray-600 dark:bg-gray-700 text-white text-sm px-3 [color-scheme:dark]"
                style={{ width: `${width}px`, height: `${Math.max(height, 40)}px` }}
              />
            </div>
          );
        case "checkbox":
          return (
            <div
              key={field.id}
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                width: `${Math.min(width, rightEdge - left)}px`,
                height: `${Math.max(height, 32)}px`,
              }}
              className="z-10 flex items-center gap-2 px-2 py-1 rounded-md bg-gray-600 dark:bg-gray-700 text-white"
            >
              <input
                type="checkbox"
                checked={(value as boolean) || false}
                onChange={(e) => onFieldChange(field.id, e.target.checked)}
                className="h-5 w-5 rounded border-2 border-gray-400 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
              />
              <Label className="text-sm font-medium break-words flex-1 text-white">{field.label}</Label>
            </div>
          );
        case "signature":
          return (
            <div
              key={field.id}
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${Math.max(height, 50)}px`,
                zIndex: 10 + (field.position ?? 0),
              }}
              className="z-10"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => onFieldChange(field.id, "signed")}
                className="w-full h-full border-2 border-blue-500 bg-gray-600 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-500 dark:hover:bg-gray-600 transition-colors"
                style={{ width: `${width}px`, height: `${Math.max(height, 50)}px` }}
              >
                {value ? "✓ Signed" : "Click to Sign"}
              </Button>
            </div>
          );
        default:
          return null;
      }
    } else {
      // Read-only mode - Professional contract document styling with FIXED dimensions
      switch (field.type) {
        case "text":
          // STRICT: Fixed-size field with overflow hidden - no continuation
          const textValue = hasValue ? (value as string) : "";
          
          // Use default PDF typography (Field type has no typography properties)
          const fieldTypography: PDFTypographyConfig = {
            ...DEFAULT_PDF_TYPOGRAPHY,
          };
          
          return (
            <div
              key={field.id}
              className="pdf-field read-only"
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`, // STRICT: Fixed height
                zIndex: 10 + (field.position ?? 0),
                boxSizing: "border-box",
                overflow: "hidden", // STRICT: No overflow visible
                fontFamily: fieldTypography.fontFamily,
                fontSize: `${fieldTypography.fontSize}px`,
                lineHeight: fieldTypography.lineHeight,
                fontWeight: fieldTypography.fontWeight,
                color: fieldTypography.textColor,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {textValue || "—"}
            </div>
          );
        case "date":
          return (
            <div
              key={field.id}
              className="pdf-field read-only"
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`, // FIXED height
                zIndex: 10 + (field.position ?? 0),
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
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
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`, // FIXED height
                zIndex: 10 + (field.position ?? 0),
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`, // FIXED height
                zIndex: 10 + (field.position ?? 0),
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader size="lg" text="Loading PDF..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-lg font-semibold ">Error Loading PDF</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <style>{PDF_FIELD_STYLES}</style>
      <div className={`${className} w-full ${isEditable ? "overflow-x-auto" : ""}`}>
        {isEditable && fieldOverflows.size > 0 && (
          <OverflowWarningBanner count={fieldOverflows.size} />
        )}

        {isEditable && orderedFields.length > 0 && (
          <FieldsListPanel
            orderedFields={orderedFields}
            showFieldsList={showFieldsList}
            onToggleList={() => setShowFieldsList(!showFieldsList)}
            fieldOverflows={fieldOverflows}
          />
        )}

        <div className="flex flex-col items-center space-y-10 py-8 max-w-full">
          {pages.map(({ pageNum, imageData, width, height }) => {
            const pageFields = fieldsByPage.get(pageNum) || [];
            const renderedDims = renderedDimensions.get(pageNum) || { width, height };
            return (
              <ContractPageRow
                key={pageNum}
                pageNum={pageNum}
                imageData={imageData}
                numPages={numPages}
                isEditable={isEditable}
                pageFields={pageFields}
                renderedDims={renderedDims}
                renderField={renderField}
                onPageRef={onPageRef}
                onImageLoad={onImageLoad}
              />
            );
          })}

        {/* REMOVED: Virtual continuation pages - fields are strictly fixed-size */}
      </div>
    </div>
    </>
  );
}
