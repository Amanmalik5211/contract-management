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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Blueprints</h1>
              <p className="mt-2">Create and manage contract templates</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "Create Blueprint"}
            </Button>
          </div>

          {showCreateForm && (
            <BlueprintForm
              onSubmit={handleCreateBlueprint}
              onCancel={() => setShowCreateForm(false)}
              submitLabel="Create Blueprint"
            />
          )}

          {blueprints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter Blueprints</CardTitle>
              </CardHeader>
              <CardContent>
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
          )}

          {/* Blueprints List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedFieldTypes.length === 0
                  ? "All Blueprints"
                  : selectedFieldTypes.length === 1
                  ? `${fieldTypeLabels[selectedFieldTypes[0]]} Blueprints`
                  : "Filtered Blueprints"}
              </CardTitle>
              <CardDescription>
                {filteredBlueprints.length === 0
                  ? "No blueprints found"
                  : `Showing ${filteredBlueprints.length} blueprint${filteredBlueprints.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBlueprints.length === 0 ? (
                <div className="py-12 text-center">
                  <p>
                    {searchQuery || selectedFieldTypes.length > 0
                      ? "No blueprints match your search or filter criteria."
                      : "No blueprints found."}
                  </p>
                  {!searchQuery && selectedFieldTypes.length === 0 && blueprints.length === 0 && (
                    <p className="text-sm mt-2">Create your first blueprint to get started</p>
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
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            </CardContent>
          </Card>
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
