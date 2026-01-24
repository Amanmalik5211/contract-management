"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import type { ContractStatus } from "@/types/contract";
import type { FieldType } from "@/types/field";
import { useToast } from "@/components/ui/toaster";
import { getStatusLabel } from "@/lib/contract-utils";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { DashboardGraphsSection } from "@/components/dashboard/dashboard-graphs-section";
import { ContractsListSection } from "@/components/dashboard/contracts-list-section";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

export default function Dashboard() {
  const { contracts, blueprints, deleteContract, deleteBlueprint, updateContractStatus } = useStore();
  const router = useRouter();
  const { addToast } = useToast();
  const [viewType, setViewType] = useState<"contract" | "blueprint">("contract");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ContractStatus[]>([]);
  const [selectedFieldTypes, setSelectedFieldTypes] = useState<FieldType[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: "contract" | "blueprint" } | null>(null);

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let filtered = [...contracts];

    // Filter by status (multiple selection)
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((c) => selectedStatuses.includes(c.status));
    }

    // Filter by search query (contract name or blueprint name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.blueprintName.toLowerCase().includes(query)
      );
    }

    // Sort by updated date, most recent first
    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [contracts, selectedStatuses, searchQuery]);

  // Filter and sort blueprints
  const filteredBlueprints = useMemo(() => {
    let filtered = [...blueprints];

    // Filter by field types
    if (selectedFieldTypes.length > 0) {
      filtered = filtered.filter((bp) =>
        bp.fields.some((field) => selectedFieldTypes.includes(field.type))
      );
    }

    // Filter by search query (blueprint name or description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (bp) =>
          bp.name.toLowerCase().includes(query) ||
          (bp.description && bp.description.toLowerCase().includes(query))
      );
    }

    // Sort by updated date, most recent first
    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [blueprints, selectedFieldTypes, searchQuery]);

  const statusOrder: ContractStatus[] = [
    "created",
    "approved",
    "sent",
    "signed",
    "locked",
    "revoked",
  ];

  const statusFilterOptions = statusOrder.map((status) => ({
    value: status,
    label: getStatusLabel(status),
  }));

  const fieldTypeLabels: Record<FieldType, string> = {
    text: "Text Input",
    date: "Date Picker",
    signature: "Signature",
    checkbox: "Checkbox",
  };

  const fieldTypes: FieldType[] = ["text", "date", "signature", "checkbox"];
  const fieldTypeFilterOptions = fieldTypes.map((type) => ({
    value: type,
    label: fieldTypeLabels[type],
  }));

  const handleView = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewType === "contract") {
      router.push(`/contracts/${id}`);
    } else {
      router.push(`/blueprints/${id}`);
    }
  };

  const handleStatusChange = (contractId: string, newStatus: ContractStatus) => {
    updateContractStatus(contractId, newStatus);
    addToast({
      title: "Status Updated",
      description: `Contract status changed to "${getStatusLabel(newStatus)}".`,
      variant: "success",
    });
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewType === "contract") {
      router.push(`/contracts/${id}?edit=true`);
      addToast({
        title: "Opening Editor",
        description: "Contract editor opened. Make your changes and click Update to save.",
        variant: "default",
      });
    } else {
      router.push(`/blueprints/${id}?edit=true`);
    }
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToDelete({ id, name, type: viewType });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === "contract") {
        deleteContract(itemToDelete.id);
        addToast({
          title: "Contract Deleted",
          description: `"${itemToDelete.name}" has been deleted successfully.`,
          variant: "success",
        });
      } else {
        deleteBlueprint(itemToDelete.id);
        addToast({
          title: "Blueprint Deleted",
          description: `"${itemToDelete.name}" has been deleted successfully.`,
          variant: "success",
        });
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden from-primary/5 via-background to-secondary/30">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
      

          <KPICards contracts={contracts} blueprints={blueprints} />

          <DashboardGraphsSection 
            contracts={viewType === "contract" ? contracts : []} 
            blueprints={viewType === "blueprint" ? blueprints : []}
            viewType={viewType}
          />

          <ContractsListSection
            viewType={viewType}
            filteredContracts={filteredContracts}
            filteredBlueprints={filteredBlueprints}
            selectedStatuses={selectedStatuses}
            selectedFieldTypes={selectedFieldTypes}
            searchQuery={searchQuery}
            searchPlaceholder="Search"
            filterOptions={viewType === "contract" ? statusFilterOptions : fieldTypeFilterOptions}
            fieldTypeLabels={fieldTypeLabels}
            onView={handleView}
            onStatusChange={viewType === "contract" ? handleStatusChange : undefined}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSearchChange={setSearchQuery}
            onFilterToggle={(value) => {
              if (viewType === "contract") {
                const status = value as ContractStatus;
                setSelectedStatuses((prev) =>
                  prev.includes(status)
                    ? prev.filter((s) => s !== status)
                    : [...prev, status]
                );
              } else {
                const fieldType = value as FieldType;
                setSelectedFieldTypes((prev) =>
                  prev.includes(fieldType)
                    ? prev.filter((t) => t !== fieldType)
                    : [...prev, fieldType]
                );
              }
            }}
            onClearFilters={() => {
              setSelectedStatuses([]);
              setSelectedFieldTypes([]);
              setSearchQuery("");
            }}
            showToggle={true}
            toggleValue={viewType}
            onToggleChange={setViewType}
          />
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setItemToDelete(null);
        }}
        itemName={itemToDelete?.name || ""}
        itemType={itemToDelete?.type || "contract"}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

