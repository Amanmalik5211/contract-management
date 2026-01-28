"use client";

import React from "react";
import type { Field } from "@/types/field";
import { GripVertical } from "lucide-react";

interface DraggableFieldWrapperProps {
  field: Field;
  index: number;
  isEditable: boolean;
  draggedFieldIndex: number | null;
  dragOverIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onFieldsReorder?: (reorderedFields: Field[]) => void;
  children: React.ReactNode;
}

export function DraggableFieldWrapper({
  field,
  index,
  isEditable,
  draggedFieldIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onFieldsReorder,
  children,
}: DraggableFieldWrapperProps) {
  const isDragging = draggedFieldIndex === index;
  const isDragOver = dragOverIndex === index && draggedFieldIndex !== null && draggedFieldIndex !== index;

  return (
    <div
      key={field.id}
      draggable={isEditable && !!onFieldsReorder}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`relative group ${
        isEditable && onFieldsReorder ? "cursor-move" : ""
      } ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${
        isDragOver ? "border-t-4 border-t-blue-400" : ""
      } transition-all duration-200`}
    >
      {isEditable && onFieldsReorder && (
        <div 
          className="absolute -left-10 top-2 group-hover:block hidden cursor-grab active:cursor-grabbing z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Drag to reorder"
          draggable={true}
          onDragStart={(e) => onDragStart(e, index)}
          onDragEnd={onDragEnd}
        >
          <GripVertical className="h-5 w-5  hover:text-gray-600 dark:hover:text-gray-300" />
        </div>
      )}
      <div
        className={`${
          isEditable && onFieldsReorder
            ? "border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600"
            : ""
        } transition-colors`}
      >
        {children}
      </div>
    </div>
  );
}

