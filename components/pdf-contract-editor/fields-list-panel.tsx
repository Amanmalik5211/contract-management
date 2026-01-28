"use client";

import type { Field } from "@/types/field";
import { Button } from "@/components/ui/button";
import { List, AlertTriangle } from "lucide-react";

export interface FieldsListPanelProps {
  orderedFields: Field[];
  showFieldsList: boolean;
  onToggleList: () => void;
  fieldOverflows: Map<string, boolean>;
}

export function FieldsListPanel({
  orderedFields,
  showFieldsList,
  onToggleList,
  fieldOverflows,
}: FieldsListPanelProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onToggleList}
        className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 text-xs sm:text-sm"
        aria-expanded={showFieldsList}
        aria-controls="contract-fields-list"
      >
        <List className="h-4 w-4 shrink-0" />
        Fields ({orderedFields.length})
      </Button>

      {showFieldsList && (
        <div
          id="contract-fields-list"
          role="region"
          aria-label="Contract fields"
          className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-700"
        >
          <h3 className="font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">Fields</h3>
          <div className="space-y-2">
            {orderedFields.map((field) => {
              const hasOverflow = fieldOverflows.get(field.id);
              return (
                <div
                  key={field.id}
                  className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg border transition-colors ${
                    hasOverflow ? "border-yellow-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm break-words">{field.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {field.type} {field.pageNumber != null ? `• Page ${field.pageNumber}` : ""}
                    </p>
                  </div>
                  {hasOverflow && (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-400" title="Text exceeds field space">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Overflow
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
