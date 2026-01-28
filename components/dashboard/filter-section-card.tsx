"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SearchAndFilter } from "@/components/shared/search-and-filter";
import type { ContractStatus } from "@/types/contract";
import type { FieldType } from "@/types/field";

interface FilterSectionCardProps {
  searchQuery: string;
  selectedFilters: ContractStatus[] | FieldType[];
  filterOptions: Array<{ value: ContractStatus | FieldType; label: string }>;
  searchPlaceholder?: string;
  showToggle?: boolean;
  toggleValue?: "contract" | "blueprint";
  onSearchChange: (query: string) => void;
  onFilterToggle: (value: ContractStatus | FieldType) => void;
  onClearFilters: () => void;
  onToggleChange?: (value: "contract" | "blueprint") => void;
}

export function FilterSectionCard({
  searchQuery,
  selectedFilters,
  filterOptions,
  searchPlaceholder = "Search",
  showToggle = false,
  toggleValue = "contract",
  onSearchChange,
  onFilterToggle,
  onClearFilters,
  onToggleChange,
}: FilterSectionCardProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <Card className="group relative overflow-visible rounded-2xl sm:rounded-3xl border-gray-300 shadow-md hover:shadow-md hover:translate-y-0 z-10">
        <CardContent className="relative z-20 p-6 sm:p-8">
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            selectedFilters={selectedFilters}
            onFilterToggle={onFilterToggle}
            onClearFilters={onClearFilters}
            filterOptions={filterOptions}
            searchPlaceholder={searchPlaceholder}
            filterLabel="Filters"
            showToggle={showToggle}
            toggleValue={toggleValue}
            onToggleChange={onToggleChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

