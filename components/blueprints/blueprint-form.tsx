"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
        <CardDescription>Define a reusable contract template with fields</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Blueprint Name</Label>
            <Input
              id="name"
              placeholder="e.g., Service Agreement"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Brief description of this template"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-2 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 break-words overflow-auto resize-none"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="headerImageUrl">Header Image URL (optional)</Label>
            <Input
              id="headerImageUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.headerImageUrl}
              onChange={(e) => setFormData({ ...formData, headerImageUrl: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>

        {/* Add Fields */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-semibold">Add Fields</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="fieldLabel">Field Label</Label>
              <Input
                id="fieldLabel"
                placeholder="e.g., Signature"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="fieldType">Field Type</Label>
              <select
                id="fieldType"
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                className="mt-2 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="w-full"
              >
                Add Field
              </Button>
            </div>
          </div>

          {/* Fields List */}
          {formData.fields.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">
                {formData.fields.length} field{formData.fields.length !== 1 ? "s" : ""} added
              </p>
              <div className="space-y-2">
                {formData.fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{field.label}</p>
                      <p className="text-xs">{fieldTypeLabels[field.type]}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(field.id)}
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
        <div className="flex justify-end gap-2 border-t pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || formData.fields.length === 0}
            className="flex-1"
          >
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

