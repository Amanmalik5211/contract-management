"use client";

import { Button } from "@/components/ui/button";
import type { Field, FieldType } from "@/types/field";

interface FieldListProps {
  fields: Field[];
  fieldTypeLabels: Record<FieldType, string>;
  onRemoveField: (fieldId: string) => void;
}

export function FieldList({ fields, fieldTypeLabels, onRemoveField }: FieldListProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-4">
      <p className="text-sm font-medium">
        {fields.length} field{fields.length !== 1 ? "s" : ""} added
      </p>
      <div className="space-y-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium">{field.label}</p>
              <p className="text-xs">{fieldTypeLabels[field.type]}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveField(field.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

