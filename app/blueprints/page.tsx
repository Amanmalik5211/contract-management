"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Blueprint } from "@/types/blueprint";
import type { Field } from "@/types/field";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { BlueprintForm } from "@/components/blueprints/blueprint-form";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

export default function BlueprintManager() {
  const router = useRouter();
  const { addBlueprint, deleteBlueprint } = useStore();
  const { addToast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blueprintToDelete, setBlueprintToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleCreateBlueprint = (formData: {
    name: string;
    description: string;
    headerImageUrl: string;
    fields: Field[];
  }) => {
    const blueprint: Blueprint = {
      id: `bp-${generateUUID()}`,
      name: formData.name,
      description: formData.description,
      headerImageUrl: formData.headerImageUrl.trim() || undefined,
      fields: formData.fields,
      sections: [],
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
  };

  const confirmDelete = () => {
    if (blueprintToDelete) {
      deleteBlueprint(blueprintToDelete.id);
      addToast({
        title: "Blueprint Deleted",
        description: `"${blueprintToDelete.name}" has been deleted successfully.`,
        variant: "success",
      });
      setDeleteDialogOpen(false);
      setBlueprintToDelete(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden from-primary/5 via-background to-secondary/30">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
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
        </div>
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
    </div>
  );
}
