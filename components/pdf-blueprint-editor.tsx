"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { Field, FieldType } from "@/types/field";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { generateUUID } from "@/lib/utils";
import { FieldTypeSelector } from "./pdf-blueprint-editor/field-type-selector";
import { FieldsList } from "./pdf-blueprint-editor/fields-list";
import { PdfPageRenderer } from "./pdf-blueprint-editor/pdf-page-renderer";
import { findFieldsOverlappingPdfText } from "@/lib/pdf-text-overlap";
import type { PdfBlueprintEditorProps } from "@/types/components";

const getPdfjsLib = async () => {
  if (typeof window === "undefined") return null;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return lib;
};

export function PdfBlueprintEditor({
  pdfUrl,
  fields,
  onFieldsChange,
  className = "",
}: PdfBlueprintEditorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pages, setPages] = useState<Array<{ pageNum: number; imageData: string; width: number; height: number }>>([]);
  const [selectedFieldType, setSelectedFieldType] = useState<FieldType>("text");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isPlacingField, setIsPlacingField] = useState(false);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [overlappingFields, setOverlappingFields] = useState<Set<string>>(new Set());
  const [fieldsOverlappingPdfText, setFieldsOverlappingPdfText] = useState<Set<string>>(new Set());
  const [fieldsWithTextOverflow, setFieldsWithTextOverflow] = useState<Set<string>>(new Set());
  const [allowOverlap, setAllowOverlap] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState<Awaited<ReturnType<typeof getPdfjsLib>>>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const fieldRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const fieldsByPage = new Map<number, Field[]>();
  fields.forEach((field) => {
    if (field.pageNumber) {
      const pageNum = field.pageNumber;
      if (!fieldsByPage.has(pageNum)) {
        fieldsByPage.set(pageNum, []);
      }
      fieldsByPage.get(pageNum)!.push(field);
    }
  });

  const doFieldsOverlap = useCallback((field1: Field, field2: Field): boolean => {
    if (!field1.x || !field1.y || !field1.width || !field1.height) return false;
    if (!field2.x || !field2.y || !field2.width || !field2.height) return false;
    if (field1.id === field2.id) return false; // Don't check self
    if (field1.pageNumber !== field2.pageNumber) return false; // Only check same page

    const field1Right = field1.x + field1.width;
    const field1Bottom = field1.y + field1.height;
    const field2Right = field2.x + field2.width;
    const field2Bottom = field2.y + field2.height;

    const threshold = 0.5; 
    return !(
      field1Right <= field2.x + threshold ||
      field2Right <= field1.x + threshold ||
      field1Bottom <= field2.y + threshold ||
      field2Bottom <= field1.y + threshold
    );
  }, []);

  const findOverlappingFields = useCallback((fieldsToCheck: Field[]): Set<string> => {
    const overlapping = new Set<string>();
    
    for (let i = 0; i < fieldsToCheck.length; i++) {
      for (let j = i + 1; j < fieldsToCheck.length; j++) {
        if (doFieldsOverlap(fieldsToCheck[i], fieldsToCheck[j])) {
          overlapping.add(fieldsToCheck[i].id);
          overlapping.add(fieldsToCheck[j].id);
        }
      }
    }
    
    return overlapping;
  }, [doFieldsOverlap]);

  useEffect(() => {
    const overlapping = findOverlappingFields(fields);
    setOverlappingFields(overlapping);

    const overflowIs = new Set<string>();
    fields.forEach(field => {
      const page = pages.find(p => p.pageNum === field.pageNumber);
      if (!page) return;
      
      const fieldWidthPx = ((field.width || 25) / 100) * page.width;
      const textWidthPx = (field.label?.length || 0) * 8; 
      
      if (textWidthPx > fieldWidthPx) {
        overflowIs.add(field.id);
      }
    });
    setFieldsWithTextOverflow(overflowIs);
  }, [fields, findOverlappingFields, pages]);

  useEffect(() => {
    if (!pdfjsLib || fields.length === 0) {
      setFieldsOverlappingPdfText(new Set());
      return;
    }

    let isMounted = true;

    const checkPdfTextOverlaps = async () => {
      try {
        const overlappingIds = await findFieldsOverlappingPdfText(pdfUrl, fields, pdfjsLib);
        if (isMounted) {
          setFieldsOverlappingPdfText(overlappingIds);
        }
      } catch (error) {
        console.warn("Failed to check PDF text overlaps:", error);
        if (isMounted) {
          setFieldsOverlappingPdfText(new Set());
        }
      }
    };

    checkPdfTextOverlaps();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, fields, pdfjsLib]);

  // Load PDF
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdfjsLibInstance = await getPdfjsLib();
        if (!pdfjsLibInstance) {
          setError("PDF.js not available");
          setLoading(false);
          return;
        }
        setPdfjsLib(pdfjsLibInstance);

        const loadingTask = pdfjsLibInstance.getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        const totalPages = pdf.numPages;
        setNumPages(totalPages);

        const pagePromises = [];
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          pagePromises.push(
            pdf.getPage(pageNum).then(async (page) => {
              const viewport = page.getViewport({ scale: 1.5 });
              
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
              
              return {
                pageNum,
                imageData: canvas.toDataURL("image/png"),
                width: viewport.width,
                height: viewport.height,
              };
            })
          );
        }

        const renderedPages = await Promise.all(pagePromises);
        
        if (!isMounted) return;

        setPages(renderedPages.filter((p): p is { pageNum: number; imageData: string; width: number; height: number } => p !== null));
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  const handlePageClick = useCallback((e: React.PointerEvent<HTMLDivElement>, pageNum: number) => {
    if (!isPlacingField) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const actualWidth = rect.width;
    const actualHeight = rect.height;
    const x = ((e.clientX - rect.left) / actualWidth) * 100;
    const y = ((e.clientY - rect.top) / actualHeight) * 100;

    const defaultWidth = 25; // 25% of page width 
    const defaultHeight = 8; // 8% of page height 

    const newField: Field = {
      id: `field-${generateUUID()}`,
      type: selectedFieldType,
      label: `${selectedFieldType.charAt(0).toUpperCase() + selectedFieldType.slice(1)} Field`,
      position: fields.length,
      required: false,
      pageNumber: pageNum,
      x: Math.max(0, Math.min(100 - defaultWidth, x)),
      y: Math.max(0, Math.min(100 - defaultHeight, y)),
      width: defaultWidth,
      height: defaultHeight,
    };

    const pageFields = fields.filter(f => f.pageNumber === pageNum);
    const overlappingField = pageFields.find(existingField => doFieldsOverlap(newField, existingField));

    if (overlappingField && !allowOverlap) {
      const shouldPlace = window.confirm(
        "⚠️ Warning: This field overlaps with an existing field. Do you want to place it anyway?"
      );
      if (!shouldPlace) {
        return; 
      }
    }

    onFieldsChange([...fields, newField]);
    setIsPlacingField(false);
    setSelectedField(newField.id);
    setAllowOverlap(false); 
  }, [isPlacingField, selectedFieldType, fields, onFieldsChange, allowOverlap, doFieldsOverlap]);

  const handleTogglePlacingField = useCallback(() => {
    setIsPlacingField(!isPlacingField);
    setSelectedField(null);
  }, [isPlacingField]);

  const handleCancelPlacing = useCallback(() => {
    setIsPlacingField(false);
    setSelectedField(null);
  }, []);

  const handleFieldTypeChange = useCallback((type: FieldType) => {
    setSelectedFieldType(type);
    setIsPlacingField(false);
    setSelectedField(null);
  }, []);

  const handleDeleteField = useCallback((fieldId: string) => {
    onFieldsChange(fields.filter((f) => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  }, [fields, onFieldsChange, selectedField]);

  const handleFieldLabelChange = useCallback((fieldId: string, label: string) => {
    onFieldsChange(
      fields.map((f) => (f.id === fieldId ? { ...f, label } : f))
    );
  }, [fields, onFieldsChange]);

  const handleFieldDragStart = useCallback((e: React.PointerEvent, fieldId: string) => {
    e.stopPropagation();
    if (e.pointerType === "touch") e.preventDefault();
    const field = fields.find((f) => f.id === fieldId);
    if (!field || field.x === undefined || field.y === undefined) return;

    const container = e.currentTarget.closest(".relative") as HTMLElement | null;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const startX = ((e.clientX - rect.left) / rect.width) * 100;
    const startY = ((e.clientY - rect.top) / rect.height) * 100;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      console.log("Pointer capture failed");
    }

    setDraggingField(fieldId);
    setDragStart({ x: startX - field.x, y: startY - field.y });
    setSelectedField(fieldId);
  }, [fields]);

  const handleFieldDrag = useCallback((e: PointerEvent | MouseEvent, pageNum: number) => {
    if (!draggingField || !dragStart) return;

    const pageContainer = pageRefs.current.get(pageNum)?.querySelector(".relative") as HTMLElement | null;
    if (!pageContainer) return;

    const rect = pageContainer.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const field = fields.find((f) => f.id === draggingField);
    if (!field || field.width === undefined) return;

    const newX = Math.max(0, Math.min(100 - (field.width || 25), currentX - dragStart.x));
    const newY = Math.max(0, Math.min(100 - (field.height || 8), currentY - dragStart.y));

    onFieldsChange(
      fields.map((f) =>
        f.id === draggingField
          ? { ...f, x: newX, y: newY }
          : f
      )
    );
  }, [draggingField, dragStart, fields, onFieldsChange]);

  const handleFieldDragEnd = useCallback(() => {
    setDraggingField(null);
    setDragStart(null);
  }, []);

  const handleFieldResizeStart = useCallback((e: React.PointerEvent, fieldId: string) => {
    e.stopPropagation();
    if (e.pointerType === "touch") e.preventDefault();
    const field = fields.find((f) => f.id === fieldId);
    if (!field || field.x === undefined || field.y === undefined || field.width === undefined || field.height === undefined) return;

    const container = e.currentTarget.closest(".relative") as HTMLElement | null;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const startX = ((e.clientX - rect.left) / rect.width) * 100;
    const startY = ((e.clientY - rect.top) / rect.height) * 100;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
console.log("Pointer capture failed");
    }

    setResizingField(fieldId);
    setResizeStart({
      x: startX,
      y: startY,
      width: field.width,
      height: field.height,
    });
    setSelectedField(fieldId);
  }, [fields]);

  const handleFieldResize = useCallback((e: PointerEvent | MouseEvent, pageNum: number) => {
    if (!resizingField || !resizeStart) return;

    const pageContainer = pageRefs.current.get(pageNum)?.querySelector(".relative") as HTMLElement | null;
    if (!pageContainer) return;

    const rect = pageContainer.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const field = fields.find((f) => f.id === resizingField);
    if (!field || field.x === undefined || field.y === undefined) return;

    const deltaX = currentX - resizeStart.x;
    const deltaY = currentY - resizeStart.y;

    const newWidth = Math.max(8, Math.min(100 - field.x, resizeStart.width + deltaX));
    const newHeight = Math.max(4, Math.min(100 - field.y, resizeStart.height + deltaY));

    onFieldsChange(
      fields.map((f) =>
        f.id === resizingField
          ? { ...f, width: newWidth, height: newHeight }
          : f
      )
    );
  }, [resizingField, resizeStart, fields, onFieldsChange]);

  const handleFieldResizeEnd = useCallback(() => {
    setResizingField(null);
    setResizeStart(null);
  }, []);

  useEffect(() => {
    if (!draggingField && !resizingField) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (draggingField) {
        const field = fields.find((f) => f.id === draggingField);
        if (field?.pageNumber) handleFieldDrag(e, field.pageNumber);
      }
      if (resizingField) {
        const field = fields.find((f) => f.id === resizingField);
        if (field?.pageNumber) handleFieldResize(e, field.pageNumber);
      }
    };

    const handlePointerUp = () => {
      if (draggingField) handleFieldDragEnd();
      if (resizingField) handleFieldResizeEnd();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggingField, resizingField, fields, handleFieldDrag, handleFieldResize, handleFieldDragEnd, handleFieldResizeEnd]);


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
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">Error Loading PDF</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <FieldTypeSelector
        selectedFieldType={selectedFieldType}
        onFieldTypeChange={handleFieldTypeChange}
        isPlacingField={isPlacingField}
        onTogglePlacingField={handleTogglePlacingField}
        onCancelPlacing={handleCancelPlacing}
        overlappingFieldsCount={overlappingFields.size}
        pdfTextOverlappingFieldsCount={fieldsOverlappingPdfText.size}
        textOverflowFieldsCount={fieldsWithTextOverflow.size}
        fieldsCount={fields.length}
      />

      <div className="space-y-3 sm:space-y-4">
        {pages.map(({ pageNum, imageData, width, height }) => {
          const pageFields = fieldsByPage.get(pageNum) || [];
          
          return (
            <PdfPageRenderer
              key={pageNum}
              pageNum={pageNum}
              numPages={numPages}
              imageData={imageData}
              width={width}
              height={height}
              pageFields={pageFields}
              isPlacingField={isPlacingField}
              selectedField={selectedField}
              draggingField={draggingField}
              resizingField={resizingField}
              overlappingFields={overlappingFields}
              fieldsOverlappingPdfText={fieldsOverlappingPdfText}
              fieldsWithTextOverflow={fieldsWithTextOverflow}
              onPageClick={handlePageClick}
              onFieldDragStart={handleFieldDragStart}
              onFieldResizeStart={handleFieldResizeStart}
              onFieldSelect={setSelectedField}
              onFieldLabelChange={handleFieldLabelChange}
              onFieldDelete={handleDeleteField}
              pageRef={(el) => {
                if (el) pageRefs.current.set(pageNum, el);
              }}
              fieldRefs={fieldRefs.current}
            />
          );
        })}
      </div>

      <FieldsList
        fields={fields}
        selectedField={selectedField}
        overlappingFields={overlappingFields}
        onSelectField={setSelectedField}
        onDeleteField={handleDeleteField}
      />
    </div>
  );
}

