"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import Link from "next/link";
import type { Field, FieldType } from "@/types/field";
import type { DocumentSection } from "@/types/blueprint";
import { generateUUID } from "@/lib/utils";
import { DocumentRenderer } from "@/components/document-renderer";
import { capitalizeWords } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";

function BlueprintViewPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getBlueprint, updateBlueprint } = useStore();
  const { addToast } = useToast();
  const blueprint = getBlueprint(params.id as string);

  const isEditMode = searchParams.get("edit") === "true";

  // Initialize form data with blueprint data if available
  const [formData, setFormData] = useState(() => ({
    name: blueprint?.name || "",
    description: blueprint?.description || "",
    headerImageUrl: blueprint?.headerImageUrl || "",
    fields: blueprint?.fields || [] as Field[],
  }));
  const [newField, setNewField] = useState<{
    label: string;
    type: FieldType;
  }>({
    label: "",
    type: "text",
  });
  const initializedRef = useRef(false);

  const fieldTypeLabels: Record<FieldType, string> = {
    text: "Text Input",
    date: "Date Picker",
    signature: "Signature",
    checkbox: "Checkbox",
  };

  // Update form data when blueprint ID changes or entering edit mode (only once per blueprint)
  useEffect(() => {
    if (blueprint && isEditMode && !initializedRef.current) {
      initializedRef.current = true;
      // Use setTimeout to defer state update and avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setFormData({
          name: blueprint.name,
          description: blueprint.description || "",
          headerImageUrl: blueprint.headerImageUrl || "",
          fields: blueprint.fields || [],
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    if (!isEditMode) {
      initializedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprint?.id, isEditMode]);

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

  const handleUpdate = () => {
    if (!blueprint || !formData.name.trim()) {
      addToast({
        title: "Validation Error",
        description: "Please provide a blueprint name.",
        variant: "error",
      });
      return;
    }

    updateBlueprint(blueprint.id, {
      name: formData.name,
      description: formData.description,
      headerImageUrl: formData.headerImageUrl.trim() || undefined,
      fields: formData.fields,
      sections: blueprint.sections || [],
    });

    addToast({
      title: "Blueprint Updated",
      description: `"${formData.name}" has been updated successfully.`,
      variant: "success",
    });

    router.push("/blueprints");
  };

  if (!blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Blueprint Not Found</h2>
            <p className="mb-4">The blueprint you are looking for does not exist.</p>
            <Button onClick={() => router.push("/blueprints")}>Go to Blueprints</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>
          {!isEditMode ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold wrap-break-words">{capitalizeWords(blueprint.name)}</h1>
        
          <p className="mt-2 text-sm">
            Created {format(new Date(blueprint.createdAt), "MMM d, yyyy")}
          </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/blueprints/${blueprint.id}?edit=true`)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </>
          ) : (
            <div>
              <h1 className="text-3xl font-bold wrap-break-words">Edit Blueprint</h1>
              <p className="mt-2 text-sm text-blue-600">
                Make your changes and click Update to save.
              </p>
            </div>
          )}
        </div>

        {!isEditMode ? (
          <>
            {/* Document Preview */}
            <div className="mb-8">
              <DocumentRenderer
                title={blueprint.name}
                description={blueprint.description}
                headerImageUrl={blueprint.headerImageUrl}
                sections={blueprint.sections || []}
                fields={blueprint.fields}
                fieldValues={{}}
                isEditable={false}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Link href={`/contracts/new?blueprintId=${blueprint.id}`}>
                <Button>Create Contract from This Blueprint</Button>
              </Link>
            </div>
          </>
        ) : (
        <Card>
          <CardHeader>
              <CardTitle>Edit Blueprint</CardTitle>
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
                <Button
                  variant="outline"
                  onClick={() => router.push(`/blueprints/${blueprint.id}`)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={!formData.name.trim()}
                >
                  Update
                </Button>
              </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}

export default function BlueprintViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      }
    >
      <BlueprintViewPageContent />
    </Suspense>
  );
}

