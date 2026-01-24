"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContractCard } from "@/components/contracts/contract-card";
import { BlueprintCard } from "@/components/blueprints/blueprint-card";
import { SearchAndFilter } from "@/components/shared/search-and-filter";
import { getStatusLabel } from "@/lib/contract-utils";
import type { Contract, ContractStatus } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";
import type { FieldType } from "@/types/field";

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
  searchPlaceholder = "Search contracts...",
  filterOptions,
  fieldTypeLabels,
  onEdit,
  onDelete,
  onSearchChange,
  onFilterToggle,
  onClearFilters,
  showToggle = false,
  toggleValue = "contract",
  onToggleChange,
}: ContractsListSectionProps) {
  const filteredItems = viewType === "contract" ? filteredContracts : filteredBlueprints;
  const selectedFilters = viewType === "contract" ? selectedStatuses : selectedFieldTypes;
  return (
    <section className="py-6 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl px-2">
          {viewType === "contract"
            ? selectedStatuses.length === 0
              ? "All Contracts"
              : selectedStatuses.length === 1
              ? `${getStatusLabel(selectedStatuses[0])} Contracts`
              : "Filtered Contracts"
            : selectedFieldTypes.length === 0
            ? "All Blueprints"
            : selectedFieldTypes.length === 1
            ? `Filtered Blueprints`
            : "Filtered Blueprints"}
        </h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
          {filteredItems.length === 0
            ? `No ${viewType === "contract" ? "contracts" : "blueprints"} found`
            : `Showing ${filteredItems.length} ${viewType === "contract" ? "contract" : "blueprint"}${filteredItems.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filter Section */}
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

      {filteredContracts.length === 0 ? (
        <Card className="rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg">
          <CardContent className="py-12 text-center">
            <p className="text-base sm:text-lg text-muted-foreground">
              {searchQuery || selectedFilters.length > 0
                ? `No ${viewType === "contract" ? "contracts" : "blueprints"} match your search or filter criteria.`
                : `No ${viewType === "contract" ? "contracts" : "blueprints"} found.`}
            </p>
            {!searchQuery && selectedFilters.length === 0 && viewType === "contract" && (
              <Link href="/contracts/new" className="mt-4 inline-block">
                <Button size="lg">Create your first contract</Button>
              </Link>
            )}
            {(searchQuery || selectedFilters.length > 0) && (
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={onClearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {viewType === "contract"
            ? filteredContracts.map((contract) => {
                const canEdit = contract.status === "created";
                const canDelete = contract.status === "created" || contract.status === "revoked";

                return (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                );
              })
            : filteredBlueprints.map((blueprint) => (
                <BlueprintCard
                  key={blueprint.id}
                  blueprint={blueprint}
                  fieldTypeLabels={fieldTypeLabels || {}}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
        </div>
      )}
    </section>
  );
}

