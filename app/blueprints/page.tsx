
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
import { BlueprintCard } from "@/components/blueprints/blueprint-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlueprintManager() {
  const router = useRouter();
  const { blueprints, addBlueprint, deleteBlueprint } = useStore();
  const { addToast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blueprintToDelete, setBlueprintToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // New State for View Mode
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");

  // Wait for store hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateBlueprint = async (formData: {
    name: string;
    description?: string;
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
        description: formData.description,
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
      
      // Return to blueprints list
      setIsCreating(false);
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

  const filteredBlueprints = blueprints.filter(bp => {
    const matchesSearch = bp.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Mock logic for status filters since status isn't stored yet
    const matchesFilter = filter === "All" || filter === "Active"; 
    return matchesSearch && matchesFilter;
  });

  return (
    <PageLayout isLoading={isInitialLoad} loadingText="Loading blueprints...">
      <div className="space-y-6 sm:space-y-8">
        
        {!isCreating ? (
          <>
            {/* List View Header */}
            <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Blueprints</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Create and manage your document blueprints.
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Create Blueprint
              </Button>
            </section>

             {/* Toolbar */}
            <section className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex bg-muted/50 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                  {["All", "Active", "Drafts", "Archived"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                        filter === f 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                      )}
                    >
                      {f}
                    </button>
                  ))}
               </div>
               <div className="relative w-full sm:w-72">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search blueprints..." 
                   className="pl-9 bg-background"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
            </section>

            {/* Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredBlueprints.length > 0 ? (
                 filteredBlueprints.map(bp => (
                   <BlueprintCard 
                      key={bp.id} 
                      blueprint={bp}
                   />
                 ))
               ) : (
                 <div className="col-span-full py-12 text-center text-muted-foreground">
                    <p>No blueprints found.</p>
                 </div>
               )}
            </section>
          </>
        ) : (
          <>
             
             
               <BlueprintForm
                 onSubmit={handleCreateBlueprint}
                 onCancel={() => setIsCreating(false)}
                 submitLabel="Create Blueprint"
               />
          </>
        )}
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
