"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { Field } from "@/types/field";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

import type { PdfContractEditorProps, PDFTypographyConfig } from "./pdf-contract-editor/types";
import { DEFAULT_PDF_TYPOGRAPHY, PDF_FIELD_STYLES } from "./pdf-contract-editor/constants";
import { validateTextFits, calculateLineHeightPx } from "./pdf-contract-editor/validation";
import { getPdfjsLib, yieldToEventLoop } from "./pdf-contract-editor/pdf-utils";
import { ContractPageRow } from "./pdf-contract-editor/contract-page-row";
import { FieldsListPanel } from "@/components/pdf-contract-editor/fields-list-panel";
import { OverflowWarningBanner } from "./pdf-contract-editor/overflow-warning-banner";
import { contractMarginLeft, contractMarginRight, contractMarginTop, contractMarginBottom } from "@/lib/contract-pdf-layout";
import { EditableTextField } from "./pdf-contract-editor/editable-text-field";
import { EditableDateField } from "./pdf-contract-editor/editable-date-field";
import { EditableCheckboxField } from "./pdf-contract-editor/editable-checkbox-field";
import { EditableSignatureField } from "./pdf-contract-editor/editable-signature-field";
import { ReadOnlyFieldRenderer } from "./pdf-contract-editor/read-only-field-renderer";

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
      const hasOverflow = fieldOverflows.get(field.id) || false;
      
      switch (field.type) {
        case "text":
          return (
            <EditableTextField
              key={field.id}
              field={field}
              value={(value as string) || ""}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              left={left}
              top={top}
              width={width}
              height={height}
              hasOverflow={hasOverflow}
              onValueChange={(nextValue) => onFieldChange(field.id, nextValue)}
              onOverflowChange={(hasOverflow) => {
                setFieldOverflows((prev) => {
                  const m = new Map(prev);
                  if (hasOverflow) {
                    m.set(field.id, true);
                  } else {
                    m.delete(field.id);
                  }
                  return m;
                });
              }}
              textareaRef={(el) => {
                if (el) textareaRefs.current.set(field.id, el);
                else textareaRefs.current.delete(field.id);
              }}
            />
          );
        case "date":
          return (
            <EditableDateField
              key={field.id}
              field={field}
              value={
                value instanceof Date
                  ? value
                  : typeof value === "string"
                    ? value
                    : null
              }
              left={left}
              top={top}
              width={width}
              height={height}
              onValueChange={(nextValue) => onFieldChange(field.id, nextValue)}
            />
          );
        case "checkbox":
          return (
            <EditableCheckboxField
              key={field.id}
              field={field}
              value={typeof value === "boolean" ? value : null}
              left={left}
              top={top}
              width={width}
              height={height}
              rightEdge={rightEdge}
              onValueChange={(nextValue) => onFieldChange(field.id, nextValue)}
            />
          );
        case "signature":
          return (
            <EditableSignatureField
              key={field.id}
              field={field}
              value={typeof value === "string" || typeof value === "boolean" ? value : null}
              left={left}
              top={top}
              width={width}
              height={height}
              onValueChange={(nextValue) => onFieldChange(field.id, nextValue)}
            />
          );
        default:
          return null;
      }
    } else {
      return (
        <ReadOnlyFieldRenderer
          key={field.id}
          field={field}
          value={value}
          hasValue={hasValue}
          left={left}
          top={top}
          width={width}
          height={height}
        />
      );
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
      <div className={`${className} w-full ${isEditable ? "overflow-x-hidden overflow-y-visible" : "overflow-hidden"}`}>
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

        <div className="flex flex-col items-center space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6 md:py-8 max-w-full px-2 sm:px-4">
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
