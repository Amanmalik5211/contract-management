"use client";

import type { Field } from "@/types/field";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface EditableDateFieldProps {
  field: Field;
  value: string | Date | null;
  left: number;
  top: number;
  width: number;
  height: number;
  onValueChange: (value: string) => void;
}

export function EditableDateField({
  field,
  value,
  left,
  top,
  width,
  height,
  onValueChange,
}: EditableDateFieldProps) {
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
        pointerEvents: "auto",
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
        onChange={(e) => onValueChange(e.target.value)}
        className="h-full border-2 border-blue-500 bg-gray-600 dark:bg-gray-700 text-white text-xs sm:text-sm px-2 sm:px-3 [color-scheme:dark] touch-manipulation"
        style={{ 
          width: `${width}px`, 
          height: `${Math.max(height, 36)}px`,
          minHeight: "36px",
        }}
      />
    </div>
  );
}

