"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Field, FieldType } from "@/types/field";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { PageLayout } from "@/components/shared/page-layout";
import { BlueprintHeader } from "@/components/blueprints/blueprint-header";
import { BlueprintPreviewSection } from "@/components/blueprints/blueprint-preview-section";
import { BlueprintEditForm } from "@/components/blueprints/blueprint-edit-form";
import { BlueprintNotFound } from "@/components/blueprints/blueprint-not-found";
import { FileText } from "lucide-react";

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
        <BlueprintNotFound />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mb-8 sm:mb-12">
        <BlueprintHeader blueprint={blueprint} isEditMode={isEditMode} />
      </div>

      {!isEditMode ? (
        <>
          <BlueprintPreviewSection blueprint={blueprint} />

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
        <div className="space-y-8">
          <div className="flex justify-end border-b pb-4">
             <Link href={`/contracts/new?blueprintId=${blueprint.id}`}>
               <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Create Contract
               </Button>
             </Link>
          </div>
          <BlueprintEditForm
            blueprint={blueprint}
            formData={formData}
            newField={newField}
            fieldTypeLabels={fieldTypeLabels}
            onFormDataChange={setFormData}
            onNewFieldChange={setNewField}
            onAddField={handleAddField}
            onRemoveField={handleRemoveField}
            onUpdate={handleUpdate}
          />
        </div>
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

