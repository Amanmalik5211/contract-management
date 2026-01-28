"use client";

import Image from "next/image";
import type { Field } from "@/types/field";
import { FieldOverlay } from "./field-overlay";

interface PdfPageRendererProps {
  pageNum: number;
  numPages: number;
  imageData: string;
  width: number;
  height: number;
  pageFields: Field[];
  isPlacingField: boolean;
  selectedField: string | null;
  draggingField: string | null;
  resizingField: string | null;
  overlappingFields: Set<string>;
  fieldsOverlappingPdfText: Set<string>;
  fieldsWithTextOverflow: Set<string>;
  onPageClick: (e: React.PointerEvent<HTMLDivElement>, pageNum: number) => void;
  onFieldDragStart: (e: React.PointerEvent, fieldId: string) => void;
  onFieldResizeStart: (e: React.PointerEvent, fieldId: string) => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldLabelChange: (fieldId: string, label: string) => void;
  onFieldDelete: (fieldId: string) => void;
  pageRef: (el: HTMLDivElement | null) => void;
  fieldRefs: Map<string, HTMLDivElement | null>;
}

export function PdfPageRenderer({
  pageNum,
  numPages,
  imageData,
  width,
  height,
  pageFields,
  isPlacingField,
  selectedField,
  draggingField,
  resizingField,
  overlappingFields,
  fieldsOverlappingPdfText,
  fieldsWithTextOverflow,
  onPageClick,
  onFieldDragStart,
  onFieldResizeStart,
  onFieldSelect,
  onFieldLabelChange,
  onFieldDelete,
  pageRef,
  fieldRefs,
}: PdfPageRendererProps) {
  return (
    <div
      ref={pageRef}
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
          onPointerDown={(e) => {
            if (isPlacingField) {
              onPageClick(e, pageNum);
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
                pageRef(container as HTMLDivElement);
              }
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-0">
            Page {pageNum} of {numPages}
          </div>
          
          {/* Field Overlays - Allow overflow for larger handles */}
          <div className="absolute inset-0 overflow-visible" style={{ width: '100%', height: '100%' }}>
            {pageFields.map((field) => (
              <FieldOverlay
                key={field.id}
                field={field}
                isSelected={selectedField === field.id}
                isDragging={draggingField === field.id}
                isResizing={resizingField === field.id}
                hasOverlap={overlappingFields.has(field.id)}
                hasPdfTextOverlap={fieldsOverlappingPdfText.has(field.id)}
                hasTextOverflow={fieldsWithTextOverflow.has(field.id)}
                isPlacingField={isPlacingField}
                onDragStart={onFieldDragStart}
                onResizeStart={onFieldResizeStart}
                onSelect={onFieldSelect}
                onLabelChange={onFieldLabelChange}
                onDelete={onFieldDelete}
                fieldRef={(el) => {
                  if (el) fieldRefs.set(field.id, el);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

