"use client";

import React from "react";
import type { Field } from "@/types/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, GripVertical, AlertTriangle } from "lucide-react";

interface FieldOverlayProps {
  field: Field;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  hasOverlap: boolean;
  hasPdfTextOverlap: boolean;
  hasTextOverflow: boolean;
  isPlacingField: boolean;
  onDragStart: (e: React.PointerEvent, fieldId: string) => void;
  onResizeStart: (e: React.PointerEvent, fieldId: string) => void;
  onSelect: (fieldId: string) => void;
  onLabelChange: (fieldId: string, label: string) => void;
  onDelete: (fieldId: string) => void;
  fieldRef: (el: HTMLDivElement | null) => void;
}

export function FieldOverlay({
  field,
  isSelected,
  isDragging,
  isResizing,
  hasOverlap,
  hasPdfTextOverlap,
  hasTextOverflow,
  isPlacingField,
  onDragStart,
  onResizeStart,
  onSelect,
  onLabelChange,
  onDelete,
  fieldRef,
}: FieldOverlayProps) {
  if (!field.pageNumber || field.x === undefined || field.y === undefined) {
    return null;
  }

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const widthPercent = clamp(field.width ?? 25, 1, 100);
  const heightPercent = clamp(field.height ?? 8, 1, 100);

  let leftPercent = clamp(field.x, 0, 100);
  let topPercent = clamp(field.y, 0, 100);
  if (leftPercent + widthPercent > 100) leftPercent = 100 - widthPercent;
  if (topPercent + heightPercent > 100) topPercent = 100 - heightPercent;

  return (
    <div
      ref={fieldRef}
      style={{
        position: "absolute",
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        ...(!isPlacingField && { touchAction: "none" }),
      }}
      className={`z-10 border-2 ${
        hasPdfTextOverlap
          ? "border-red-500 bg-red-100/50 shadow-xl ring-2 ring-red-300 animate-pulse"
          : hasTextOverflow
          ? "border-orange-500 bg-orange-100/50 shadow-xl ring-2 ring-orange-300"
          : hasOverlap
          ? "border-yellow-500 bg-yellow-100/50 shadow-xl ring-2 ring-yellow-300 animate-pulse"
          : isSelected
          ? "border-blue-500 bg-blue-100/40 shadow-xl ring-2 ring-blue-300"
          : "border-gray-400 bg-gray-100/30 hover:border-blue-400 hover:bg-blue-50/30"
      } rounded-md sm:rounded-lg transition-all overflow-visible ${isDragging || isResizing ? "opacity-90 scale-105 shadow-2xl z-50" : ""} ${
        isPlacingField ? "pointer-events-none" : "cursor-move"
      } group hover:shadow-lg`}
      onPointerDown={(e) => {
        if (!isPlacingField) {
          onDragStart(e, field.id);
        }
      }}
      onClick={(e) => {
        if (!isPlacingField) {
          e.stopPropagation();
          onSelect(field.id);
        }
      }}
    >
      {hasPdfTextOverlap && (
        <div
          className="hidden xs:flex absolute -top-6 sm:-top-7 right-0 bg-red-600 text-white rounded-md px-2 py-1.5 text-xs sm:text-sm z-40 items-center gap-1.5 shadow-lg"
          title="This field overlaps PDF text. Field text will not be drawn in the downloaded PDF."
        >
          <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">PDF Text</span>
        </div>
      )}

      {hasTextOverflow && !hasPdfTextOverlap && (
        <div
          className="hidden xs:flex absolute -top-6 sm:-top-7 right-0 bg-orange-600 text-white rounded-md px-2 py-1.5 text-xs sm:text-sm z-40 items-center gap-1.5 shadow-lg"
          title="Field text exceeds the field width."
        >
          <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">Overflow</span>
        </div>
      )}

      {hasOverlap && !hasPdfTextOverlap && !hasTextOverflow && (
        <div
          className="hidden xs:flex absolute -top-6 sm:-top-7 right-0 bg-yellow-600 text-white rounded-md px-2 py-1.5 text-xs sm:text-sm z-40 items-center gap-1.5 shadow-lg"
          title="This field overlaps another and may not display correctly on the downloaded PDF."
        >
          <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">Overlap</span>
        </div>
      )}

      {isSelected && !isPlacingField && (
        <div 
          className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 bg-blue-500 text-white rounded-full p-2 sm:p-2.5 cursor-move hover:bg-blue-600 active:bg-blue-700 z-40 shadow-lg border-2 border-white touch-none transition-all hover:scale-110 active:scale-95"
          title="Drag to move field"
        >
          <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      )}

      {isSelected && !isPlacingField && (
        <div
          className="absolute -bottom-2 sm:-bottom-3 -right-2 sm:-right-3 min-w-[44px] min-h-[44px] sm:min-w-[56px] sm:min-h-[56px] w-11 h-11 sm:w-14 sm:h-14 bg-blue-500 rounded-full border-[3px] sm:border-4 border-white cursor-nwse-resize hover:bg-blue-600 active:bg-blue-700 touch-none z-40 flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          title="Drag to resize field"
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, field.id);
          }}
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white rounded-sm"></div>
        </div>
      )}

      {isSelected && (
        <div
          className="absolute -top-12 sm:-top-14 left-0 right-0 border-2 border-blue-500 dark:border-blue-400 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl z-40 flex items-center gap-2  text-white bg-gray-900/90 backdrop-blur-sm"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            value={field.label}
            onChange={(e) => onLabelChange(field.id, e.target.value)}
            className="h-8 sm:h-9 text-sm sm:text-base w-full min-w-0 border-gray-300 dark:border-gray-600 focus:border-blue-500 bg-gray-950/40"
            placeholder="Field label"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
            title="Delete field"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}

      {(hasPdfTextOverlap || hasOverlap || hasTextOverflow) && (
        <div className="hidden xs:block absolute top-2 left-2 right-2 z-30 pointer-events-none">
          <div
            className={`rounded-md px-2 py-1 text-[10px] sm:text-xs font-medium text-center shadow ${
              hasPdfTextOverlap
                ? "bg-red-600/90 text-white"
                : hasTextOverflow
                ? "bg-orange-600/90 text-white"
                : "bg-yellow-600/90 text-white"
            }`}
          >
            {hasPdfTextOverlap
              ? "Overlaps PDF text — field text won’t be added to downloaded PDF"
              : hasTextOverflow 
              ? "Text exceeds field width"
              : "Overlaps another field — may not render correctly in download"}
          </div>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 text-white text-xs sm:text-sm font-medium px-2 py-1 sm:py-1.5 text-center rounded-b ${
        hasPdfTextOverlap ? "bg-red-600/90" : hasTextOverflow ? "bg-orange-600/90" : hasOverlap ? "bg-yellow-600/90" : "bg-black/70"
      }`}>
        <span className="capitalize">{field.type}</span>
      </div>

      {!isSelected && (
        <div className="absolute inset-0 flex items-center justify-center px-1 py-1">
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate text-center w-full">
            {field.label || "Unnamed field"}
          </span>
        </div>
      )}
    </div>
  );
}

