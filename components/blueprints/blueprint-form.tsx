"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateUUID } from "@/lib/utils";
import type { Field, FieldType } from "@/types/field";

interface BlueprintFormProps {
  initialData?: {
    name: string;
    description: string;
    headerImageUrl: string;
    fields: Field[];
  };
  onSubmit: (data: {
    name: string;
    description: string;
    headerImageUrl: string;
    fields: Field[];
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function BlueprintForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Blueprint",
}: BlueprintFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    headerImageUrl: initialData?.headerImageUrl || "",
    fields: initialData?.fields || [] as Field[],
  });
  const [newField, setNewField] = useState<{
    label: string;
    type: FieldType;
  }>({
    label: "",
    type: "text",
  });

  const fieldTypeLabels: Record<FieldType, string> = {
    text: "Text Input",
    date: "Date Picker",
    signature: "Signature",
    checkbox: "Checkbox",
  };

  const handleAddField = () => {
    if (newField.label.trim()) {
      const field: Field = {
        id: `field-${generateUUID()}`,
        type: newField.type,
        label: newField.label,
        position: {
          x: Math.random() * 800,
          y: Math.random() * 400,
        },
        required: true,
      };

      setFormData({
        ...formData,
        fields: [...formData.fields, field],
      });

      setNewField({ label: "", type: "text" });
    }
  };

  const handleRemoveField = (fieldId: string) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((f) => f.id !== fieldId),
    });
  };

  const handleSubmit = () => {
    if (formData.name.trim() && formData.fields.length > 0) {
      onSubmit(formData);
      // Reset form after submission
      setFormData({
        name: "",
        description: "",
        headerImageUrl: "",
        fields: [],
      });
      setNewField({
        label: "",
        type: "text",
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-300 dark:border-gray-700 shadow-xl">
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl sm:text-2xl">{submitLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Blueprint Name</Label>
            <Input
              id="name"
              placeholder="e.g., Service Agreement"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 h-11 sm:h-12 rounded-xl sm:rounded-2xl border-gray-300 dark:border-gray-700 transition-colors focus:border-gray-400 dark:focus:border-gray-600 shadow-sm"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <textarea
              id="description"
              placeholder="Brief description of this template"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-2 flex min-h-[100px] w-full rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:border-gray-400 dark:focus-visible:border-gray-600 disabled:cursor-not-allowed disabled:opacity-50 break-words overflow-auto resize-none transition-colors shadow-sm"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="headerImageUrl" className="text-sm font-medium">Header Image URL (optional)</Label>
            <Input
              id="headerImageUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.headerImageUrl}
              onChange={(e) => setFormData({ ...formData, headerImageUrl: e.target.value })}
              className="mt-2 h-11 sm:h-12 rounded-xl sm:rounded-2xl border-gray-300 dark:border-gray-700 transition-colors focus:border-gray-400 dark:focus:border-gray-600 shadow-sm"
            />
          </div>
        </div>

        {/* Add Fields */}
        <div className="space-y-4 rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6 shadow-md">
          <h3 className="font-semibold text-base sm:text-lg">Add Fields</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="fieldLabel" className="text-sm font-medium">Field Label</Label>
              <Input
                id="fieldLabel"
                placeholder="e.g., Signature"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="mt-2 h-11 sm:h-12 rounded-xl sm:rounded-2xl border-gray-300 dark:border-gray-700 transition-colors focus:border-gray-400 dark:focus:border-gray-600 shadow-sm"
              />
            </div>
            <div>
              <Label htmlFor="fieldType" className="text-sm font-medium">Field Type</Label>
              <select
                id="fieldType"
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                className="mt-2 flex h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:border-gray-400 dark:focus-visible:border-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm"
              >
                <option value="text">Text Input</option>
                <option value="date">Date Picker</option>
                <option value="signature">Signature</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddField}
                variant="outline"
                size="lg"
                className="w-full h-11 sm:h-12 shadow-md"
                disabled={!newField.label.trim()}
              >
                Add Field
              </Button>
            </div>
          </div>

          {/* Fields List */}
          {formData.fields.length > 0 && (
            <div className="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-4">
              <p className="text-sm font-medium">
                {formData.fields.length} field{formData.fields.length !== 1 ? "s" : ""} added
              </p>
              <div className="space-y-2">
                {formData.fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{field.label}</p>
                      <p className="text-xs">{fieldTypeLabels[field.type]}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(field.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-300 dark:border-gray-700 pt-6">
          {onCancel && (
            <Button variant="outline" size="lg" onClick={onCancel} className="h-11 sm:h-12 px-6 shadow-md">
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || formData.fields.length === 0}
            size="lg"
            className="h-11 sm:h-12 px-8 shadow-md"
          >
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

