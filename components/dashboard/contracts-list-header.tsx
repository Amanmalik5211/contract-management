"use client";

import { getStatusLabel } from "@/lib/contract-utils";
import type { ContractStatus } from "@/types/contract";
import type { FieldType } from "@/types/field";

interface ContractsListHeaderProps {
  viewType: "contract" | "blueprint";
  selectedStatuses: ContractStatus[];
  selectedFieldTypes: FieldType[];
  itemCount: number;
}

export function ContractsListHeader({
  viewType,
  selectedStatuses,
  selectedFieldTypes,
  itemCount,
}: ContractsListHeaderProps) {
  const filteredItems = viewType === "contract" ? selectedStatuses : selectedFieldTypes;
  const itemType = viewType === "contract" ? "contract" : "blueprint";
  const itemTypePlural = viewType === "contract" ? "contracts" : "blueprints";

  const getTitle = () => {
    if (viewType === "contract") {
      if (selectedStatuses.length === 0) return "All Contracts";
      if (selectedStatuses.length === 1) return `${getStatusLabel(selectedStatuses[0])} Contracts`;
      return "Filtered Contracts";
    } else {
      if (selectedFieldTypes.length === 0) return "All Blueprints";
      return "Filtered Blueprints";
    }
  };

  return (
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl px-2">
        {getTitle()}
      </h2>
      <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
        {itemCount === 0
          ? `No ${itemTypePlural} found`
          : `Showing ${itemCount} ${itemType}${itemCount !== 1 ? "s" : ""}`}
      </p>
    </div>
  );
}

