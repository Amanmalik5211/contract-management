"use client";

import type { Field } from "@/types/field";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { capitalizeWords } from "@/lib/utils";

interface EditableFieldRendererProps {
  field: Field;
  value: string | boolean | Date | null;
  onFieldChange: (fieldId: string, value: string | boolean) => void;
}

export function EditableFieldRenderer({
  field,
  value,
  onFieldChange,
}: EditableFieldRendererProps) {
  const fieldId = field.id;

  switch (field.type) {
    case "text":
      return (
        <div key={fieldId} className="space-y-2">
          <Label htmlFor={fieldId} className="text-sm font-semibold break-words overflow-wrap-anywhere">
            {capitalizeWords(field.label)}
            {field.required && <span className="ml-1">*</span>}
          </Label>
          <textarea
            id={fieldId}
            value={(value as string) || ""}
            onChange={(e) => onFieldChange(fieldId, e.target.value)}
            className="w-full min-h-[100px] rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-y break-words overflow-wrap-anywhere"
            rows={4}
            placeholder="Enter text..."
          />
        </div>
      );
    case "date":
      return (
        <div key={fieldId} className="space-y-2">
          <Label htmlFor={fieldId} className="text-sm font-semibold break-words overflow-wrap-anywhere">
            {capitalizeWords(field.label)}
            {field.required && <span className="ml-1">*</span>}
          </Label>
          <Input
            id={fieldId}
            type="date"
            value={
              value instanceof Date
                ? format(value, "yyyy-MM-dd")
                : (value as string) || ""
            }
            onChange={(e) => onFieldChange(fieldId, e.target.value)}
            className="w-full border-gray-300 dark:border-gray-700"
          />
        </div>
      );
    case "checkbox":
      return (
        <div key={fieldId} className="flex items-start space-x-3 py-2">
          <input
            type="checkbox"
            id={fieldId}
            checked={(value as boolean) || false}
            onChange={(e) => onFieldChange(fieldId, e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 shrink-0"
          />
          <Label htmlFor={fieldId} className="text-sm font-semibold cursor-pointer break-words overflow-wrap-anywhere">
            {capitalizeWords(field.label)}
            {field.required && <span className="ml-1">*</span>}
          </Label>
        </div>
      );
    case "signature":
      return (
        <div key={fieldId} className="space-y-2">
          <Label className="text-sm font-semibold break-words overflow-wrap-anywhere">
            {capitalizeWords(field.label)}
            {field.required && <span className="ml-1">*</span>}
          </Label>
          <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700">
            {value ? (
              <div className="text-sm">Signature captured</div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onFieldChange(fieldId, "signed")}
                className="text-sm"
              >
                Click to Sign
              </Button>
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
}

