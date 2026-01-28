"use client";

import { useState } from "react";
import type { Contract, ContractStatus } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";
import type { FieldType } from "@/types/field";
import { canTransitionTo } from "@/lib/contract-utils";
import { ContractsListHeader } from "./contracts-list-header";
import { FilterSectionCard } from "./filter-section-card";
import { EmptyStateCard } from "./empty-state-card";
import { ContractsTable } from "./contracts-table";
import { StatusChangeModalInline } from "./status-change-modal-inline";

const defaultFieldTypeLabels: Record<FieldType, string> = {
  text: "Text Input",
  date: "Date Picker",
  signature: "Signature",
  checkbox: "Checkbox",
};

interface ContractsListSectionProps {
  viewType: "contract" | "blueprint";
  filteredContracts: Contract[];
  filteredBlueprints: Blueprint[];
  selectedStatuses: ContractStatus[];
  selectedFieldTypes: FieldType[];
  searchQuery: string;
  searchPlaceholder?: string;
  filterOptions: Array<{ value: ContractStatus | FieldType; label: string }>;
  fieldTypeLabels?: Record<FieldType, string>;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, name: string, e: React.MouseEvent) => void;
  onView?: (id: string, e: React.MouseEvent) => void;
  onStatusChange?: (contractId: string, newStatus: ContractStatus) => void;
  onSearchChange: (query: string) => void;
  onFilterToggle: (value: ContractStatus | FieldType) => void;
  onClearFilters: () => void;
  showToggle?: boolean;
  toggleValue?: "contract" | "blueprint";
  onToggleChange?: (value: "contract" | "blueprint") => void;
}

export function ContractsListSection({
  viewType,
  filteredContracts,
  filteredBlueprints,
  selectedStatuses,
  selectedFieldTypes,
  searchQuery,
  searchPlaceholder = "Search",
  filterOptions,
  fieldTypeLabels,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onSearchChange,
  onFilterToggle,
  onClearFilters,
  showToggle = false,
  toggleValue = "contract",
  onToggleChange,
}: ContractsListSectionProps) {
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  const filteredItems = viewType === "contract" ? filteredContracts : filteredBlueprints;
  const selectedFilters = viewType === "contract" ? selectedStatuses : selectedFieldTypes;
  const fieldTypeLabelsMap = fieldTypeLabels || defaultFieldTypeLabels;

  const getStatusVariant = (status: string) => {
    if (status === "signed" || status === "locked") return "success";
    if (status === "revoked") return "destructive";
    if (status === "created") return "secondary";
    return "default";
  };

  const handleChangeStatusClick = (contract: Contract, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedContract(contract);
    setStatusModalOpen(true);
  };

  const handleStatusSelect = (newStatus: ContractStatus) => {
    if (selectedContract && onStatusChange) {
      if (canTransitionTo(selectedContract.status, newStatus)) {
        onStatusChange(selectedContract.id, newStatus);
        setStatusModalOpen(false);
        setSelectedContract(null);
      }
    }
  };

  const handleRevoke = () => {
    if (selectedContract && onStatusChange) {
      const canRevoke = selectedContract.status === "created" || selectedContract.status === "sent";
      if (canRevoke) {
        onStatusChange(selectedContract.id, "revoked");
        setStatusModalOpen(false);
        setSelectedContract(null);
      }
    }
  };
  return (
    <section className="py-6 sm:py-8">
      <ContractsListHeader
        viewType={viewType}
        selectedStatuses={selectedStatuses}
        selectedFieldTypes={selectedFieldTypes}
        itemCount={filteredItems.length}
      />

      <FilterSectionCard
        searchQuery={searchQuery}
        selectedFilters={selectedFilters}
        filterOptions={filterOptions}
        searchPlaceholder={searchPlaceholder}
        showToggle={showToggle}
        toggleValue={toggleValue}
        onSearchChange={onSearchChange}
        onFilterToggle={onFilterToggle}
        onClearFilters={onClearFilters}
        onToggleChange={onToggleChange}
      />

      {filteredItems.length === 0 ? (
        <EmptyStateCard
          viewType={viewType}
          searchQuery={searchQuery}
          hasFilters={selectedFilters.length > 0}
          onClearFilters={onClearFilters}
        />
      ) : (
        <ContractsTable
          viewType={viewType}
          contracts={filteredContracts}
          blueprints={filteredBlueprints}
          fieldTypeLabels={fieldTypeLabelsMap}
          getStatusVariant={getStatusVariant}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange ? handleChangeStatusClick : undefined}
        />
      )}

      {viewType === "contract" && selectedContract && (
        <StatusChangeModalInline
          open={statusModalOpen}
          contract={selectedContract}
          getStatusVariant={getStatusVariant}
          onOpenChange={(open) => {
            setStatusModalOpen(open);
            if (!open) setSelectedContract(null);
          }}
          onStatusChange={handleStatusSelect}
          onRevoke={handleRevoke}
        />
      )}
    </section>
  );
}

