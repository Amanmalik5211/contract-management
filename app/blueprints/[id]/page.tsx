"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import Link from "next/link";
import type { Field, FieldType } from "@/types/field";
import { generateUUID } from "@/lib/utils";
import { DocumentRenderer } from "@/components/document-renderer";
import { PdfViewer } from "@/components/pdf-viewer";
import { PdfBlueprintEditor } from "@/components/pdf-blueprint-editor";
import { capitalizeWords } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { PageLayout } from "@/components/shared/page-layout";

function BlueprintViewPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getBlueprint, updateBlueprint } = useStore();
  const { addToast } = useToast();
  const blueprint = getBlueprint(params.id as string);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isEditMode = searchParams.get("edit") === "true";

  // Wait for store hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialize form data with blueprint data if available
  const [formData, setFormData] = useState(() => ({
    name: blueprint?.name || "",
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
        position: formData.fields.length,
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
      fields: formData.fields,
    });

    addToast({
      title: "Blueprint Updated",
      description: `"${formData.name}" has been updated successfully.`,
      variant: "success",
    });

    router.push("/dashboard");
  };

  // Show loading during initial load
  if (isInitialLoad) {
    return (
      <PageLayout isLoading={true} loadingText="Loading blueprint...">
        <div></div>
      </PageLayout>
    );
  }

  // Only show "not found" after initial load is complete
  if (!blueprint) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Blueprint Not Found</h2>
              <p className="mb-4">The blueprint you are looking for does not exist.</p>
              <Button onClick={() => router.push("/blueprints")}>Go to Blueprints</Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
          <div className="mb-8 sm:mb-12">
            {!isEditMode ? (
              <>
                <section className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                      <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight break-words">
                        <span className="text-primary">{capitalizeWords(blueprint.name)}</span>
                      </h1>
                      <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
                        Created {format(new Date(blueprint.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push(`/blueprints/${blueprint.id}?edit=true`)}
                      className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </section>
              </>
            ) : (
              <section className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight break-words">
                      Edit <span className="text-primary">Blueprint</span>
                    </h1>
                    <p className="text-base text-muted-foreground sm:text-lg leading-relaxed mt-2">
                      Make your changes and click Update to save.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {!isEditMode ? (
            <>
              {/* PDF Preview Section */}
              {blueprint.pdfUrl ? (
                <section className="py-6 sm:py-8 mb-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">PDF Template</h2>
                    {blueprint.pdfFileName && (
                      <p className="text-sm text-muted-foreground">
                        File: {blueprint.pdfFileName}
                        {blueprint.pageCount && ` • ${blueprint.pageCount} page${blueprint.pageCount !== 1 ? "s" : ""}`}
                      </p>
                    )}
                  </div>
                  <PdfViewer pdfUrl={blueprint.pdfUrl} />
                </section>
              ) : (
                /* Document Preview Section (fallback for non-PDF blueprints) */
                <section className="py-6 sm:py-8 mb-8">
                  <DocumentRenderer
                    title={blueprint.name}
                    sections={[]}
                    fields={blueprint.fields}
                    fieldValues={{}}
                    isEditable={false}
                  />
                </section>
              )}

              <section className="py-6 sm:py-8">
                <div className="flex justify-end">
                  <Link href={`/contracts/new?blueprintId=${blueprint.id}`} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                      Create Contract from This Blueprint
                    </Button>
                  </Link>
                </div>
              </section>
            </>
          ) : (
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>

                  {/* Add Fields + list: only when blueprint has no PDF (non-PDF edit flow) */}
                  {!blueprint.pdfUrl && (
                    <div className="space-y-4 rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6">
                      <h3 className="font-semibold text-base sm:text-lg">Add Fields</h3>
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        <div>
                          <Label htmlFor="fieldLabel" className="text-xs sm:text-sm">Field Label</Label>
                          <Input
                            id="fieldLabel"
                            placeholder="e.g., Signature"
                            value={newField.label}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            className="mt-2 border-gray-300 dark:border-gray-700 text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fieldType" className="text-xs sm:text-sm">Field Type</Label>
                          <select
                            id="fieldType"
                            value={newField.type}
                            onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
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
                            onClick={handleAddField}
                            variant="outline"
                            className="w-full text-xs sm:text-sm"
                          >
                            Add Field
                          </Button>
                        </div>
                      </div>
                      {formData.fields.length > 0 && (
                        <div className="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-4">
                          <p className="text-sm font-medium">
                            {formData.fields.length} field{formData.fields.length !== 1 ? "s" : ""} added
                          </p>
                          <div className="space-y-2">
                            {formData.fields.map((field) => (
                              <div
                                key={field.id}
                                className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                        onFieldsChange={(newFields) => setFormData((prev) => ({ ...prev, fields: newFields }))}
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
                      onClick={handleUpdate}
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
          )}
    </PageLayout>
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

