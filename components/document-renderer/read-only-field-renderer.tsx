"use client";

import type { Field } from "@/types/field";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { capitalizeWords } from "@/lib/utils";

interface ReadOnlyFieldRendererProps {
  field: Field;
  value: string | boolean | Date | null;
}

export function ReadOnlyFieldRenderer({
  field,
  value,
}: ReadOnlyFieldRendererProps) {
  const fieldId = field.id;

  switch (field.type) {
    case "text":
      return (
        <div key={fieldId} className="space-y-2">
          <Label className="text-sm font-semibold break-words overflow-wrap-anywhere">
            {capitalizeWords(field.label)}
          </Label>
          <div className="px-4 py-3 text-sm min-h-[60px] whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {value ? (
              (value as string)
            ) : (
              <span className="italic text-muted-foreground">Not filled</span>
            )}
          </div>
        </div>
      );
    case "date":
      return (
        <div key={fieldId} className="space-y-2">
          <Label className="text-sm font-semibold break-words overflow-wrap-anywhere">
            {capitalizeWords(field.label)}
          </Label>
          <div className="px-4 py-3 text-sm break-words overflow-wrap-anywhere">
            {value ? (
              value instanceof Date
                ? format(value, "MMMM d, yyyy")
                : format(new Date(value as string), "MMMM d, yyyy")
            ) : (
              <span className="italic text-muted-foreground">Not filled</span>
            )}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div key={fieldId} className="flex items-center space-x-3 py-2">
          <div className="h-5 w-5 rounded flex items-center justify-center flex-shrink-0">
            {(value as boolean) ? (
              <span className="text-lg">✓</span>
            ) : null}
          </div>
          <Label className="text-sm font-semibold break-words overflow-wrap-anywhere">
            {capitalizeWords(field.label)}
          </Label>
        </div>
      );
    case "signature":
      return (
        <div key={fieldId} className="space-y-2">
          <Label className="text-sm font-semibold break-words overflow-wrap-anywhere">
            {capitalizeWords(field.label)}
          </Label>
          <div className="flex h-32 items-center justify-center">
            {value ? (
              <div className="text-sm font-medium">✓ Signature captured</div>
            ) : (
              <div className="text-sm text-muted-foreground">No signature</div>
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
}

