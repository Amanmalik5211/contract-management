"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Blueprint } from "@/types/blueprint";
import type { Field } from "@/types/field";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { BlueprintForm } from "@/components/blueprints/blueprint-form";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { PageLayout } from "@/components/shared/page-layout";

export default function BlueprintManager() {
  const router = useRouter();
  const { addBlueprint, deleteBlueprint } = useStore();
  const { addToast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blueprintToDelete, setBlueprintToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Wait for store hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateBlueprint = async (formData: {
    name: string;
    fields: Field[];
    pdfFileName?: string;
    pdfUrl?: string;
    pageCount?: number;
  }) => {
    // Validate at least one field exists
    if (formData.fields.length === 0) {
      addToast({
        title: "Validation Error",
        description: "Please add at least one field before creating the blueprint.",
        variant: "error",
      });
      return;
    }

    try {
      const blueprint: Blueprint = {
        id: `bp-${generateUUID()}`,
        name: formData.name,
        fields: formData.fields,
        sections: [],
        pdfFileName: formData.pdfFileName,
        pdfUrl: formData.pdfUrl,
        pageCount: formData.pageCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addBlueprint(blueprint);
      addToast({
        title: "Blueprint Created",
        description: `"${blueprint.name}" has been created successfully.`,
        variant: "success",
      });
      
      // Redirect to contracts page after successful creation
      router.push("/contracts");
    } catch {
      addToast({
        title: "Error",
        description: "Failed to create blueprint. Please try again.",
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (blueprintToDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        deleteBlueprint(blueprintToDelete.id);
        addToast({
          title: "Blueprint Deleted",
          description: `"${blueprintToDelete.name}" has been deleted successfully.`,
          variant: "success",
        });
        setDeleteDialogOpen(false);
        setBlueprintToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <PageLayout isLoading={isInitialLoad} loadingText="Loading blueprints...">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight">
                <span className="text-primary">Blueprint</span> Management
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
                Create and manage reusable contract templates with structured fields
              </p>
            </div>
          </div>
        </section>

        <section className="py-6 sm:py-8">
          <BlueprintForm
            onSubmit={handleCreateBlueprint}
            submitLabel="Create Blueprint"
          />
        </section>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setBlueprintToDelete(null);
        }}
        itemName={blueprintToDelete?.name || ""}
        itemType="blueprint"
        onConfirm={confirmDelete}
      />
    </PageLayout>
  );
}
