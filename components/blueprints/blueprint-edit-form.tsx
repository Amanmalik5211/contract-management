"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfBlueprintEditor } from "@/components/pdf-blueprint-editor";
import { AddFieldForm } from "./add-field-form";
import type { Field, FieldType } from "@/types/field";
import type { Blueprint } from "@/types/blueprint";

interface BlueprintEditFormProps {
  blueprint: Blueprint;
  formData: {
    name: string;
    fields: Field[];
  };
  newField: {
    label: string;
    type: FieldType;
  };
  fieldTypeLabels: Record<FieldType, string>;
  onFormDataChange: (data: { name: string; fields: Field[] }) => void;
  onNewFieldChange: (field: { label: string; type: FieldType }) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  onUpdate: () => void;
}

export function BlueprintEditForm({
  blueprint,
  formData,
  newField,
  fieldTypeLabels,
  onFormDataChange,
  onNewFieldChange,
  onAddField,
  onRemoveField,
  onUpdate,
}: BlueprintEditFormProps) {
  const router = useRouter();

  return (
    <section className="py-6 sm:py-8">
      <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-300 dark:border-gray-700 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 dark:from-primary/20 dark:via-primary/10" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-xl sm:text-2xl">Edit Blueprint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Blueprint Name</Label>
              <Input
                id="name"
                placeholder="e.g., Service Agreement"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                className="mt-2 border-gray-300 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Add Fields + list: only when blueprint has no PDF (non-PDF edit flow) */}
          {!blueprint.pdfUrl && (
            <AddFieldForm
              newField={newField}
              fields={formData.fields}
              fieldTypeLabels={fieldTypeLabels}
              onNewFieldChange={onNewFieldChange}
              onAddField={onAddField}
              onRemoveField={onRemoveField}
            />
          )}

          {/* PDF Template: editable when blueprint has PDF — place, move, add, remove fields */}
          {blueprint.pdfUrl && (
            <div className="space-y-4 rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6">
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Edit PDF Template</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Move and resize existing fields, add new fields by clicking on the PDF, or remove fields from the list or when selected.
                </p>
                {blueprint.pdfFileName && (
                  <p className="text-sm text-muted-foreground mb-4">
                    File: {blueprint.pdfFileName}
                    {blueprint.pageCount && ` • ${blueprint.pageCount} page${blueprint.pageCount !== 1 ? "s" : ""}`}
                  </p>
                )}
              </div>
              <PdfBlueprintEditor
                pdfUrl={blueprint.pdfUrl}
                fields={formData.fields}
                onFieldsChange={(newFields) => onFormDataChange({ ...formData, fields: newFields })}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 border-t border-gray-300 dark:border-gray-700 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/blueprints/${blueprint.id}`)}
              size="lg"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={onUpdate}
              disabled={!formData.name.trim()}
              size="lg"
              className="w-full sm:w-auto"
            >
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

