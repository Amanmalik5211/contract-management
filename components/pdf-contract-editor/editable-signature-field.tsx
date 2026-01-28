"use client";

import type { Field } from "@/types/field";
import { Button } from "@/components/ui/button";

interface EditableSignatureFieldProps {
  field: Field;
  value: string | boolean | null;
  left: number;
  top: number;
  width: number;
  height: number;
  onValueChange: (value: string) => void;
}

export function EditableSignatureField({
  field,
  value,
  left,
  top,
  width,
  height,
  onValueChange,
}: EditableSignatureFieldProps) {
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
        pointerEvents: "auto",
      }}
      className="z-10"
    >
      <Button
        type="button"
        variant="outline"
        onClick={() => onValueChange("signed")}
        className="w-full h-full border-2 border-blue-500 bg-gray-600 dark:bg-gray-700 text-white text-xs sm:text-sm font-medium hover:bg-gray-500 dark:hover:bg-gray-600 transition-colors touch-manipulation"
        style={{ 
          width: `${width}px`, 
          height: `${Math.max(height, 44)}px`,
          minHeight: "44px",
        }}
      >
        {value ? "✓ Signed" : "Click to Sign"}
      </Button>
    </div>
  );
}

