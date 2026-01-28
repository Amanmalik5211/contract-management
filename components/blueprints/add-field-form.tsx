"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldType } from "@/types/field";
import { FieldList } from "./field-list";
import type { Field } from "@/types/field";

interface AddFieldFormProps {
  newField: {
    label: string;
    type: FieldType;
  };
  fields: Field[];
  fieldTypeLabels: Record<FieldType, string>;
  onNewFieldChange: (field: { label: string; type: FieldType }) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
}

export function AddFieldForm({
  newField,
  fields,
  fieldTypeLabels,
  onNewFieldChange,
  onAddField,
  onRemoveField,
}: AddFieldFormProps) {
  return (
    <div className="space-y-4 rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="font-semibold text-base sm:text-lg">Add Fields</h3>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <Label htmlFor="fieldLabel" className="text-xs sm:text-sm">Field Label</Label>
          <Input
            id="fieldLabel"
            placeholder="e.g., Signature"
            value={newField.label}
            onChange={(e) => onNewFieldChange({ ...newField, label: e.target.value })}
            className="mt-2 border-gray-300 dark:border-gray-700 text-xs sm:text-sm"
          />
        </div>
        <div>
          <Label htmlFor="fieldType" className="text-xs sm:text-sm">Field Type</Label>
          <select
            id="fieldType"
            value={newField.type}
            onChange={(e) => onNewFieldChange({ ...newField, type: e.target.value as FieldType })}
            className="mt-2 flex h-9 sm:h-10 w-full rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-2 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="text">Text Input</option>
            <option value="date">Date Picker</option>
            <option value="signature">Signature</option>
            <option value="checkbox">Checkbox</option>
          </select>
        </div>
        <div className="flex items-end sm:col-span-2 md:col-span-1">
          <Button
            onClick={onAddField}
            variant="outline"
            className="w-full text-xs sm:text-sm"
          >
            Add Field
          </Button>
        </div>
      </div>
      <FieldList
        fields={fields}
        fieldTypeLabels={fieldTypeLabels}
        onRemoveField={onRemoveField}
      />
    </div>
  );
}

