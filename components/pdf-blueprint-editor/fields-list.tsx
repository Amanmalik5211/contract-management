"use client";

import type { Field } from "@/types/field";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface FieldsListProps {
  fields: Field[];
  selectedField: string | null;
  overlappingFields: Set<string>;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
}

export function FieldsList({
  fields,
  selectedField,
  overlappingFields,
  onSelectField,
  onDeleteField,
}: FieldsListProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 sm:mt-6 p-4 sm:p-5 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-700">
      <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Placed Fields ({fields.length})</h3>
      <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
        {fields.map((field) => {
          const hasOverlap = overlappingFields.has(field.id);
          return (
            <div
              key={field.id}
              className={`flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                hasOverlap
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:border-yellow-600"
                  : selectedField === field.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md hover:border-blue-600"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
              } cursor-pointer hover:shadow-sm`}
              onClick={() => onSelectField(field.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base break-words mb-1">{field.label || "Unnamed field"}</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                  <span className="capitalize font-medium">{field.type}</span> • Page {field.pageNumber} • ({field.x?.toFixed(1)}%, {field.y?.toFixed(1)}%)
                </p>
              </div>
              {hasOverlap && (
                <span className="shrink-0 flex items-center gap-1.5 text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded" title="Overlapping fields may not display correctly on the downloaded PDF">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Overlap</span>
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteField(field.id);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 ml-2 h-9 w-9 sm:h-10 sm:w-10"
                title="Delete field"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

