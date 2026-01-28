"use client";

import type { Field } from "@/types/field";
import { Label } from "@/components/ui/label";

interface EditableCheckboxFieldProps {
  field: Field;
  value: boolean | null;
  left: number;
  top: number;
  width: number;
  height: number;
  rightEdge: number;
  onValueChange: (value: boolean) => void;
}

export function EditableCheckboxField({
  field,
  value,
  left,
  top,
  width,
  height,
  rightEdge,
  onValueChange,
}: EditableCheckboxFieldProps) {
  return (
    <div
      key={field.id}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${Math.min(width, rightEdge - left)}px`,
        height: `${Math.max(height, 32)}px`,
        pointerEvents: "auto",
      }}
      className="z-10 flex items-center gap-2 px-2 py-1 rounded-md bg-gray-600 dark:bg-gray-700 text-white"
    >
      <input
        type="checkbox"
        checked={(value as boolean) || false}
        onChange={(e) => onValueChange(e.target.checked)}
        className="h-4 w-4 sm:h-5 sm:w-5 rounded border-2 border-gray-400 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0 touch-manipulation"
        style={{ minWidth: "16px", minHeight: "16px" }}
      />
      <Label className="text-xs sm:text-sm font-medium break-words flex-1 text-white leading-tight">{field.label}</Label>
    </div>
  );
}

