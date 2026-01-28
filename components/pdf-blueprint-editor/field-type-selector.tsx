"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, AlertTriangle } from "lucide-react";
import type { FieldType } from "@/types/field";

interface FieldTypeSelectorProps {
  selectedFieldType: FieldType;
  onFieldTypeChange: (type: FieldType) => void;
  isPlacingField: boolean;
  onTogglePlacingField: () => void;
  onCancelPlacing: () => void;
  overlappingFieldsCount: number;
  pdfTextOverlappingFieldsCount: number;
  textOverflowFieldsCount: number;
  fieldsCount: number;
}

export function FieldTypeSelector({
  selectedFieldType,
  onFieldTypeChange,
  isPlacingField,
  onTogglePlacingField,
  onCancelPlacing,
  overlappingFieldsCount,
  pdfTextOverlappingFieldsCount,
  textOverflowFieldsCount,
  fieldsCount,
}: FieldTypeSelectorProps) {
  const fieldTypeDropdownRef = useRef<HTMLDivElement | null>(null);
  const [fieldTypeDropdownOpen, setFieldTypeDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fieldTypeDropdownRef.current && !fieldTypeDropdownRef.current.contains(e.target as Node)) {
        setFieldTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto" ref={fieldTypeDropdownRef}>
          <Label className="font-medium whitespace-nowrap text-xs sm:text-sm">Field Type:</Label>
          <div className="relative w-full sm:w-40">
            <button
              type="button"
              id="fieldType"
              aria-haspopup="listbox"
              aria-expanded={fieldTypeDropdownOpen}
              aria-label="Field type"
              disabled={isPlacingField}
              onClick={() => setFieldTypeDropdownOpen((v) => !v)}
              className="flex h-9 sm:h-10 w-full items-center justify-between rounded-lg sm:rounded-xl border-[1px] border-gray-200 dark:border-gray-600 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm text-left disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
            >
              <span className="capitalize">{selectedFieldType}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${fieldTypeDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {fieldTypeDropdownOpen && (
              <ul
                role="listbox"
                aria-labelledby="fieldType"
                className="absolute text-black z-50 mt-1 w-full min-w-[8rem] rounded-lg border-[1px] border-gray-200 dark:border-gray-600 bg-blue-100 py-1 shadow-lg outline-none"
              >
                {(["text", "date", "signature", "checkbox"] as const).map((type) => (
                  <li
                    key={type}
                    role="option"
                    aria-selected={selectedFieldType === type}
                    className={`relative cursor-pointer select-none px-3 py-2 text-xs sm:text-sm capitalize outline-none hover:bg-gray-100/80 dark:hover:bg-gray-700/50 focus:bg-gray-100/80 dark:focus:bg-gray-700/50 ${
                      selectedFieldType === type ? "bg-primary/10 dark:bg-primary/20 text-primary" : ""
                    }`}
                    onClick={() => {
                      onFieldTypeChange(type);
                      setFieldTypeDropdownOpen(false);
                    }}
                  >
                    {type}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={onTogglePlacingField}
            variant={isPlacingField ? "default" : "outline"}
            className={`w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap ${isPlacingField ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            {isPlacingField ? "✓ Placing Mode Active" : "Add Field"}
          </Button>
          {isPlacingField && (
            <Button
              variant="ghost"
              onClick={onCancelPlacing}
              className="border border-gray-500 hover:bg-blue-500 w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap shrink-0"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      {isPlacingField && (
        <div className="mt-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <p className="text-xs sm:text-sm font-medium">
            💡 Click anywhere on the PDF to place a <strong>{selectedFieldType}</strong> field
          </p>
          <p className="text-[10px] sm:text-xs mt-1">
            ⚠️ If the field overlaps with an existing field, you will be warned before placement.
          </p>
        </div>
      )}
      {overlappingFieldsCount > 0 && (
        <div className="mt-3 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-700 dark:text-yellow-400" />
          <p className="text-[10px] sm:text-xs text-black">
            {overlappingFieldsCount} field{overlappingFieldsCount !== 1 ? 's' : ''} overlap{overlappingFieldsCount === 1 ? 's' : ''} with other fields.
          </p>
        </div>
      )}
      {pdfTextOverlappingFieldsCount > 0 && (
        <div className="mt-2 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-700 dark:text-red-400" />
          <p className="text-[10px] sm:text-xs text-black">
            {pdfTextOverlappingFieldsCount} field{pdfTextOverlappingFieldsCount !== 1 ? 's' : ''} overlap{pdfTextOverlappingFieldsCount === 1 ? 's' : ''} with PDF text.
          </p>
        </div>
      )}
      {textOverflowFieldsCount > 0 && (
        <div className="mt-2 p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-orange-700 dark:text-orange-400" />
          <p className="text-[10px] sm:text-xs text-black">
             Text exceeds field bounds in {textOverflowFieldsCount} field{textOverflowFieldsCount !== 1 ? 's' : ''}.
          </p>
        </div>
      )}
      {!isPlacingField && fieldsCount > 0 && (
        <div className="mt-3 p-3 sm:p-4 border-2 text-black bg-blue-300 border-blue-200 dark:border-blue-800  rounded-lg sm:rounded-xl">
          <p className="text-sm sm:text-base font-medium">
            💡 <strong>Tip:</strong> Click on a field to select it, then:
          </p>
          <ul className="mt-2 text-xs sm:text-sm  space-y-1 list-disc list-inside ml-2">
            <li>Drag the <strong>top-left handle</strong> (⋮⋮) to move the field</li>
            <li>Drag the <strong>bottom-right handle</strong> (□) to resize the field</li>
            <li>Edit the label in the input box above the field</li>
          </ul>
        </div>
      )}
    </div>
  );
}

