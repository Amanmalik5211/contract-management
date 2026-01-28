"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import type { Field, FieldType } from "@/types/field";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, GripVertical, ChevronDown, AlertTriangle } from "lucide-react";
import { generateUUID } from "@/lib/utils";

// Dynamically import pdf.js only on client side to avoid DOMMatrix SSR error
const getPdfjsLib = async () => {
  if (typeof window === "undefined") return null;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return lib;
};

interface PdfBlueprintEditorProps {
  pdfUrl: string;
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
  className?: string;
}

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
  const [allowOverlap, setAllowOverlap] = useState(false);
  const pageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
  const fieldTypeDropdownRef = useRef<HTMLDivElement | null>(null);
  const [fieldTypeDropdownOpen, setFieldTypeDropdownOpen] = useState(false);
  const fieldRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Group fields by page number
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

  // Check if two fields overlap
  const doFieldsOverlap = useCallback((field1: Field, field2: Field): boolean => {
    if (!field1.x || !field1.y || !field1.width || !field1.height) return false;
    if (!field2.x || !field2.y || !field2.width || !field2.height) return false;
    if (field1.id === field2.id) return false; // Don't check self
    if (field1.pageNumber !== field2.pageNumber) return false; // Only check same page

    // Calculate bounding boxes
    const field1Right = field1.x + field1.width;
    const field1Bottom = field1.y + field1.height;
    const field2Right = field2.x + field2.width;
    const field2Bottom = field2.y + field2.height;

    // Check for overlap (with a small threshold to account for rounding)
    const threshold = 0.5; // 0.5% threshold
    return !(
      field1Right <= field2.x + threshold ||
      field2Right <= field1.x + threshold ||
      field1Bottom <= field2.y + threshold ||
      field2Bottom <= field1.y + threshold
    );
  }, []);

  // Find all overlapping fields
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

  // Update overlapping fields whenever fields change — no toast; warning shown near each overlapping field
  useEffect(() => {
    const overlapping = findOverlappingFields(fields);
    setOverlappingFields(overlapping);
  }, [fields, findOverlappingFields]);

  // Close field type dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fieldTypeDropdownRef.current && !fieldTypeDropdownRef.current.contains(e.target as Node)) {
        setFieldTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load PDF
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamically import pdf.js on client side
        const pdfjsLib = await getPdfjsLib();
        if (!pdfjsLib) {
          setError("PDF.js not available");
          setLoading(false);
          return;
        }

        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
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

  // Handle clicking on PDF to place field
  const handlePageClick = useCallback((e: React.MouseEvent<HTMLDivElement>, pageNum: number, _pageWidth: number, _pageHeight: number) => {
    if (!isPlacingField) return;

    const rect = e.currentTarget.getBoundingClientRect();
    // Use actual rendered dimensions from the bounding rect
    const actualWidth = rect.width;
    const actualHeight = rect.height;
    const x = ((e.clientX - rect.left) / actualWidth) * 100;
    const y = ((e.clientY - rect.top) / actualHeight) * 100;

    // Default field dimensions (percentage-based)
    const defaultWidth = 20; // 20% of page width
    const defaultHeight = 5; // 5% of page height

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

    // Check for overlaps with existing fields on the same page
    const pageFields = fields.filter(f => f.pageNumber === pageNum);
    const overlappingField = pageFields.find(existingField => doFieldsOverlap(newField, existingField));

    if (overlappingField && !allowOverlap) {
      const shouldPlace = window.confirm(
        "⚠️ Warning: This field overlaps with an existing field. Do you want to place it anyway?"
      );
      if (!shouldPlace) {
        return; // Cancel placement
      }
    }

    onFieldsChange([...fields, newField]);
    setIsPlacingField(false);
    setSelectedField(newField.id);
    setAllowOverlap(false); // Reset after placement
  }, [isPlacingField, selectedFieldType, fields, onFieldsChange, allowOverlap, doFieldsOverlap]);

  // Handle field deletion
  const handleDeleteField = useCallback((fieldId: string) => {
    onFieldsChange(fields.filter((f) => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  }, [fields, onFieldsChange, selectedField]);

  // Handle field label update
  const handleFieldLabelChange = useCallback((fieldId: string, label: string) => {
    onFieldsChange(
      fields.map((f) => (f.id === fieldId ? { ...f, label } : f))
    );
  }, [fields, onFieldsChange]);

  // Handle field drag start (works for mouse and touch via pointer events)
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
      // Ignore if capture fails (e.g. invalid pointer id); window pointermove/pointerup still work
    }

    setDraggingField(fieldId);
    setDragStart({ x: startX - field.x, y: startY - field.y });
    setSelectedField(fieldId);
  }, [fields]);

  // Handle field drag (works for mouse and touch)
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

    const newX = Math.max(0, Math.min(100 - (field.width || 20), currentX - dragStart.x));
    const newY = Math.max(0, Math.min(100 - (field.height || 5), currentY - dragStart.y));

    // Update field position (overlap will be detected by effect and shown via yellow border + list indicator)
    onFieldsChange(
      fields.map((f) =>
        f.id === draggingField
          ? { ...f, x: newX, y: newY }
          : f
      )
    );
  }, [draggingField, dragStart, fields, onFieldsChange]);

  // Handle field drag end
  const handleFieldDragEnd = useCallback(() => {
    setDraggingField(null);
    setDragStart(null);
  }, []);

  // Handle field resize start (works for mouse and touch via pointer events)
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
      // Ignore if capture fails (e.g. invalid pointer id); window pointermove/pointerup still work
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

  // Handle field resize (works for mouse and touch)
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

    const newWidth = Math.max(5, Math.min(100 - field.x, resizeStart.width + deltaX));
    const newHeight = Math.max(2, Math.min(100 - field.y, resizeStart.height + deltaY));

    // Update field size (overlap will be detected by effect and shown via yellow border + list indicator)
    onFieldsChange(
      fields.map((f) =>
        f.id === resizingField
          ? { ...f, width: newWidth, height: newHeight }
          : f
      )
    );
  }, [resizingField, resizeStart, fields, onFieldsChange]);

  // Handle field resize end
  const handleFieldResizeEnd = useCallback(() => {
    setResizingField(null);
    setResizeStart(null);
  }, []);

  // Set up global pointer event listeners for dragging and resizing (works for mouse + touch)
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

  // Render field overlay with drag and resize
  const renderFieldOverlay = (field: Field, pageWidth: number, pageHeight: number, pageNum: number, _scaleX: number = 1, _scaleY: number = 1) => {
    if (!field.pageNumber || field.x === undefined || field.y === undefined) {
      return null;
    }

    // Use percentage-based positioning so it scales with the container
    const leftPercent = field.x;
    const topPercent = field.y;
    const widthPercent = field.width || 20;
    const heightPercent = field.height || 5;
    const isSelected = selectedField === field.id;
    const isDragging = draggingField === field.id;
    const isResizing = resizingField === field.id;
    const hasOverlap = overlappingFields.has(field.id);

    return (
      <div
        key={field.id}
        ref={(el) => {
          if (el) fieldRefs.current.set(field.id, el);
        }}
        style={{
          position: "absolute",
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          width: `${widthPercent}%`,
          height: `${heightPercent}%`,
          ...(!isPlacingField && { touchAction: "none" }),
        }}
        className={`z-10 border-2 ${
          hasOverlap
            ? "border-yellow-500 bg-yellow-100/40 shadow-lg ring-2 ring-yellow-300 animate-pulse"
            : isSelected
            ? "border-blue-500 bg-blue-100/30 shadow-lg ring-2 ring-blue-200"
            : "border-gray-400 bg-gray-100/20 hover:border-gray-500 hover:bg-gray-100/30"
        } rounded transition-all ${isDragging || isResizing ? "opacity-80 scale-105" : ""} ${
          isPlacingField ? "pointer-events-none" : "cursor-move"
        } group`}
        onPointerDown={(e) => {
          if (!isPlacingField) {
            handleFieldDragStart(e, field.id);
          }
        }}
        onClick={(e) => {
          if (!isPlacingField) {
            e.stopPropagation();
            setSelectedField(field.id);
          }
        }}
      >
        {/* Overlap warning — above field, same style as "Text exceeds" (red banner, one per field) */}
        {hasOverlap && (
          <div
            className="absolute left-0 bottom-full mb-1.5 bg-red-600 text-white text-xs px-2.5 py-2 rounded-md shadow-lg z-30 flex items-start gap-2 pointer-events-auto max-w-[280px]"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            <span className="whitespace-normal break-words leading-snug">
              This field overlaps another. It may not display correctly on the downloaded PDF.
            </span>
          </div>
        )}

        {/* Drag handle - visible on hover/select */}
        {isSelected && !isPlacingField && (
          <div className="absolute -left-2 -top-2 bg-blue-500 text-white rounded-full p-1 cursor-move hover:bg-blue-600 z-30">
            <GripVertical className="h-3 w-3" />
          </div>
        )}

        {/* Resize handle - bottom right corner, larger for touch */}
        {isSelected && !isPlacingField && (
          <div
            className="absolute -bottom-1 -right-1 min-w-[44px] min-h-[44px] w-6 h-6 sm:w-4 sm:h-4 bg-blue-500 rounded-full border-2 border-white cursor-nwse-resize hover:bg-blue-600 touch-none z-30 flex items-center justify-center"
            onPointerDown={(e) => {
              e.stopPropagation();
              handleFieldResizeStart(e, field.id);
            }}
          />
        )}

        {/* Field label input - shown when selected */}
        {isSelected && (
          <div className="absolute -top-10 left-0  border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 shadow-lg z-20 flex items-center gap-2">
            <Input
              value={field.label}
              onChange={(e) => handleFieldLabelChange(field.id, e.target.value)}
              className="h-7 text-xs w-32"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteField(field.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
      

        {/* Field type indicator */}
        <div className={`absolute bottom-0 left-0 right-0 text-white text-xs px-1 py-0.5 text-center rounded-b ${
          hasOverlap ? "bg-yellow-600/80" : "bg-black/60"
        }`}>
          {field.type}
        </div>

        {/* Field label preview (when not selected) */}
        {!isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate px-1">
              {field.label}
            </span>
          </div>
        )}
      </div>
    );
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
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">Error Loading PDF</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Field Type Selector */}
      <div className="mb-4 p-3 sm:p-4  rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto" ref={fieldTypeDropdownRef}>
            <Label className="font-medium whitespace-nowrap text-xs sm:text-sm">Field Type:</Label>
            <div className="relative w-full sm:w-40">
              <button
                type="button"
                id="fieldType"
                aria-haspopup="listbox"
                aria-expanded={fieldTypeDropdownOpen}
                aria-label="Field type"
                disabled={isPlacingField}
                onClick={() => setFieldTypeDropdownOpen((v) => !v)}
                className="flex h-9 sm:h-10 w-full items-center justify-between rounded-lg sm:rounded-xl border-[1px] border-gray-200 dark:border-gray-600 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm text-left disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
              >
                <span className="capitalize">{selectedFieldType}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${fieldTypeDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {fieldTypeDropdownOpen && (
                <ul
                  role="listbox"
                  aria-labelledby="fieldType"
                  className="absolute text-black z-50 mt-1 w-full min-w-[8rem] rounded-lg border-[1px] border-gray-200 dark:border-gray-600 bg-blue-100 py-1 shadow-lg outline-none"
                
                >
                  {(["text", "date", "signature", "checkbox"] as const).map((type) => (
                    <li
                      key={type}
                      role="option"
                      aria-selected={selectedFieldType === type}
                      className={`relative cursor-pointer select-none px-3 py-2 text-xs sm:text-sm capitalize outline-none hover:bg-gray-100/80 dark:hover:bg-gray-700/50 focus:bg-gray-100/80 dark:focus:bg-gray-700/50 ${
                        selectedFieldType === type ? "bg-primary/10 dark:bg-primary/20 text-primary" : ""
                      }`}
                      onClick={() => {
                        setSelectedFieldType(type);
                        setFieldTypeDropdownOpen(false);
                        setIsPlacingField(false);
                        setSelectedField(null);
                      }}
                    >
                      {type}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => {
                setIsPlacingField(!isPlacingField);
                setSelectedField(null);
              }}
              variant={isPlacingField ? "default" : "outline"}
              className={`w-full sm:w-auto text-xs sm:text-sm ${isPlacingField ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            >
              {isPlacingField ? "✓ Placing Mode Active" : "Add Field"}
            </Button>
            {isPlacingField && (
              <Button
                variant="ghost"
                onClick={() => {
                  setIsPlacingField(false);
                  setSelectedField(null);
                }}
                className="border border-gray-500 hover:bg-blue-500  w-full sm:w-auto text-xs sm:text-sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        {isPlacingField && (
          <div className="mt-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-xs sm:text-sm font-medium">
              💡 Click anywhere on the PDF to place a <strong>{selectedFieldType}</strong> field
            </p>
            <p className="text-[10px] sm:text-xs mt-1">
              ⚠️ If the field overlaps with an existing field, you will be warned before placement.
            </p>
          </div>
        )}
        {overlappingFields.size > 0 && (
          <div className="mt-3 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-700 dark:text-yellow-400" />
            <p className="text-[10px] sm:text-xs text-yellow-800 dark:text-yellow-200">
              Overlapping fields are marked in the list below and may not display correctly on the downloaded PDF.
            </p>
          </div>
        )}
        {!isPlacingField && fields.length > 0 && (
          <div className="mt-3 p-2 border border-gray-400 sm:p-3 rounded">
            <p className="text-xs sm:text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Click on a field to select it, then drag to move or use the resize handle (bottom-right corner) to resize
            </p>
          </div>
        )}
      </div>

      {/* PDF Pages with Field Overlays */}
      <div className="space-y-3 sm:space-y-4">
        {pages.map(({ pageNum, imageData, width, height }) => {
          const pageFields = fieldsByPage.get(pageNum) || [];
          
          return (
            <div
              key={pageNum}
              ref={(el) => {
                if (el) pageRefs.current.set(pageNum, el);
              }}
              className="flex justify-center relative px-2 sm:px-4"
            >
              <div className="relative rounded-lg sm:rounded-xl shadow-sm overflow-visible bg-background w-full max-w-full border-0">
                <div
                  className={`relative ${isPlacingField ? "cursor-crosshair" : "cursor-default"} mx-auto`}
                  style={{ 
                    width: '100%',
                    maxWidth: `${width}px`,
                    aspectRatio: `${width} / ${height}`
                  }}
                  onClick={(e) => {
                    if (isPlacingField) {
                      const container = e.currentTarget;
                      const rect = container.getBoundingClientRect();
                      const actualWidth = rect.width;
                      const actualHeight = rect.height;
                      handlePageClick(e, pageNum, actualWidth, actualHeight);
                    }
                  }}
                >
                  <Image
                    src={imageData}
                    alt={`Page ${pageNum} of ${numPages}`}
                    width={width}
                    height={height}
                    unoptimized
                    className="block w-full h-auto"
                    draggable={false}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      const container = img.parentElement?.parentElement;
                      if (container) {
                        pageRefs.current.set(pageNum, container as HTMLDivElement);
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-0">
                    Page {pageNum} of {numPages}
                  </div>
                  
                  {/* Field Overlays - use percentage-based positioning for responsive scaling */}
                  <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                    {pageFields.map((field) => {
                      // Get actual rendered dimensions for click/drag calculations
                      const container = pageRefs.current.get(pageNum);
                      const actualWidth = container?.offsetWidth || width;
                      const actualHeight = container?.offsetHeight || height;
                      return renderFieldOverlay(field, actualWidth, actualHeight, pageNum, 1, 1);
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fields List */}
      {fields.length > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4  rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Placed Fields ({fields.length})</h3>
          <div className="space-y-2">
            {fields.map((field) => {
              const hasOverlap = overlappingFields.has(field.id);
              return (
                <div
                  key={field.id}
                  className={`flex items-center justify-between gap-2 p-2 sm:p-3 rounded border ${
                    hasOverlap
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : selectedField === field.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-700"
                  } cursor-pointer`}
                  onClick={() => setSelectedField(field.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm break-words">{field.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground break-words">
                      {field.type} • Page {field.pageNumber} • ({field.x?.toFixed(1)}%, {field.y?.toFixed(1)}%)
                    </p>
                  </div>
                  {hasOverlap && (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-400" title="Overlapping fields may not display correctly on the downloaded PDF">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Overlap
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteField(field.id);
                    }}
                    className="text-red-600 hover:text-red-700 flex-shrink-0 ml-2"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

