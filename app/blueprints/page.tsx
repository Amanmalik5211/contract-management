"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import type { Blueprint } from "@/types/blueprint";
import type { Field, FieldType } from "@/types/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { BlueprintCard } from "@/components/blueprints/blueprint-card";
import { BlueprintForm } from "@/components/blueprints/blueprint-form";
import { SearchAndFilter } from "@/components/shared/search-and-filter";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

export default function BlueprintManager() {
  const { blueprints, addBlueprint, deleteBlueprint } = useStore();
  const router = useRouter();
  const { addToast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFieldTypes, setSelectedFieldTypes] = useState<FieldType[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blueprintToDelete, setBlueprintToDelete] = useState<{ id: string; name: string } | null>(null);

  const fieldTypeLabels: Record<FieldType, string> = {
    text: "Text Input",
    date: "Date Picker",
    signature: "Signature",
    checkbox: "Checkbox",
  };

  const fieldTypes: FieldType[] = ["text", "date", "signature", "checkbox"];

  // Filter and sort blueprints
  const filteredBlueprints = useMemo(() => {
    let filtered = [...blueprints];

    // Filter by search query (blueprint name or description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (bp) =>
          bp.name.toLowerCase().includes(query) ||
          (bp.description && bp.description.toLowerCase().includes(query))
      );
    }

    // Filter by field types (if any blueprint contains at least one of the selected field types)
    if (selectedFieldTypes.length > 0) {
      filtered = filtered.filter((bp) =>
        bp.fields.some((field) => selectedFieldTypes.includes(field.type))
      );
    }

    // Sort by updated date, most recent first
    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [blueprints, selectedFieldTypes, searchQuery]);

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
    setShowCreateForm(false);
    addToast({
      title: "Blueprint Created",
      description: `"${blueprint.name}" has been created successfully.`,
      variant: "success",
    });
  };

  const handleEdit = (blueprintId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/blueprints/${blueprintId}?edit=true`);
  };

  const handleDelete = (blueprintId: string, blueprintName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBlueprintToDelete({ id: blueprintId, name: blueprintName });
    setDeleteDialogOpen(true);
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

  const fieldTypeFilterOptions = fieldTypes.map((type) => ({
    value: type,
    label: fieldTypeLabels[type],
  }));

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
                  <p className="text-sm text-muted-foreground/80 sm:text-base lg:text-lg leading-relaxed">
                    Design templates once and generate consistent contracts from them
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="w-full sm:w-auto"
                >
                  {showCreateForm ? "Cancel" : "Create Blueprint"}
                </Button>
              </div>
            </section>

            {showCreateForm && (
              <section className="py-6 sm:py-8">
                <BlueprintForm
                  onSubmit={handleCreateBlueprint}
                  onCancel={() => setShowCreateForm(false)}
                  submitLabel="Create Blueprint"
                />
              </section>
            )}

            {blueprints.length > 0 && (
              <section className="py-6 sm:py-8">
                <Card className="group relative overflow-visible rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 rounded-2xl sm:rounded-3xl" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-xl sm:text-2xl">Search & Filter Blueprints</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Find blueprints by name or filter by field types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-20">
                    <SearchAndFilter
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedFilters={selectedFieldTypes}
                      onFilterToggle={(fieldType) => {
                        setSelectedFieldTypes((prev) =>
                          prev.includes(fieldType)
                            ? prev.filter((t) => t !== fieldType)
                            : [...prev, fieldType]
                        );
                      }}
                      onClearFilters={() => {
                        setSelectedFieldTypes([]);
                        setSearchQuery("");
                      }}
                      filterOptions={fieldTypeFilterOptions}
                      searchPlaceholder="Search blueprints..."
                      filterLabel="Filters"
                    />
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Blueprints List Section */}
            <section className="py-6 sm:py-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl px-2">
                  {selectedFieldTypes.length === 0
                    ? "All Blueprints"
                    : selectedFieldTypes.length === 1
                    ? `${fieldTypeLabels[selectedFieldTypes[0]]} Blueprints`
                    : "Filtered Blueprints"}
                </h2>
                <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
                  {filteredBlueprints.length === 0
                    ? "No blueprints found"
                    : `Showing ${filteredBlueprints.length} blueprint${filteredBlueprints.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {filteredBlueprints.length === 0 ? (
                <Card className="rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <p className="text-base sm:text-lg">
                      {searchQuery || selectedFieldTypes.length > 0
                        ? "No blueprints match your search or filter criteria."
                        : "No blueprints found."}
                    </p>
                    {!searchQuery && selectedFieldTypes.length === 0 && blueprints.length === 0 && (
                      <p className="text-sm mt-2 text-muted-foreground">Create your first blueprint to get started</p>
                    )}
                    {(searchQuery || selectedFieldTypes.length > 0) && (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFieldTypes([]);
                            setSearchQuery("");
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBlueprints.map((blueprint) => (
                    <BlueprintCard
                      key={blueprint.id}
                      blueprint={blueprint}
                      fieldTypeLabels={fieldTypeLabels}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
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
