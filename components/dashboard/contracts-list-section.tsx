"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchAndFilter } from "@/components/shared/search-and-filter";
import { getStatusLabel } from "@/lib/contract-utils";
import { format } from "date-fns";
import { Eye, Pencil, Trash2, X, ArrowRight } from "lucide-react";
import type { Contract, ContractStatus } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";
import type { FieldType } from "@/types/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { canTransitionTo, STATUS_ORDER, getNextStatus } from "@/lib/contract-utils";

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

      {filteredItems.length === 0 ? (
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
        <Card className="rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1060px] md:min-w-full">
                <TableHeader>
                  <TableRow>
                    {viewType === "contract" ? (
                      <>
                        <TableHead className="text-center w-[220px]">Contract Name</TableHead>
                        <TableHead className="text-center w-[200px]">Blueprint Name</TableHead>
                        <TableHead className="text-center w-[130px]">Status</TableHead>
                        <TableHead className="text-center w-[150px]">Created Date</TableHead>
                        <TableHead className="text-center w-[160px]">Settings</TableHead>
                        <TableHead className="text-center w-[200px]">Actions</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-center w-[220px]">Blueprint Name</TableHead>
                        <TableHead className="text-center w-[300px]">Fields</TableHead>
                        <TableHead className="text-center w-[150px]">Created Date</TableHead>
                        <TableHead className="text-center w-[200px]">Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
          {viewType === "contract"
            ? filteredContracts.map((contract) => {
                const canEdit = contract.status === "created";
                const canDelete = contract.status === "created" || contract.status === "revoked";

                return (
                          <TableRow key={contract.id}>
                            <TableCell className="font-medium text-center w-[220px] whitespace-nowrap">
                              <Link
                                href={`/contracts/${contract.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {contract.name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center w-[200px] whitespace-nowrap">{contract.blueprintName}</TableCell>
                            <TableCell className="text-center w-[130px] whitespace-nowrap">
                              <Badge variant={getStatusVariant(contract.status)}>
                                {getStatusLabel(contract.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center w-[150px] whitespace-nowrap">
                              {format(new Date(contract.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-center w-[160px] whitespace-nowrap">
                              {onStatusChange && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => handleChangeStatusClick(contract, e)}
                                >
                                  Change Status
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-center w-[200px] whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                {onView && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      onView(contract.id, e);
                                    }}
                                    title="View contract"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      onEdit(contract.id, e);
                                    }}
                                    title="Edit contract"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      onDelete(contract.id, contract.name, e);
                                    }}
                                    title="Delete contract"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                );
              })
            : filteredBlueprints.map((blueprint) => (
                        <TableRow key={blueprint.id}>
                          <TableCell className="font-medium text-center w-[220px] whitespace-nowrap">
                            <Link
                              href={`/blueprints/${blueprint.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {blueprint.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-center w-[300px]">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {blueprint.fields.length > 0 ? (
                                blueprint.fields.map((field) => (
                                  <Badge key={field.id} variant="secondary" className="text-xs whitespace-nowrap">
                                    {fieldTypeLabelsMap[field.type]}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground whitespace-nowrap">No fields</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center w-[150px] whitespace-nowrap">
                            {format(new Date(blueprint.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-center w-[200px] whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              {onView && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onView(blueprint.id, e);
                                  }}
                                  title="View blueprint"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onEdit(blueprint.id, e);
                                }}
                                title="Edit blueprint"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDelete(blueprint.id, blueprint.name, e);
                                }}
                                title="Delete blueprint"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
        </div>
          </CardContent>
        </Card>
      )}

      {/* Status Change Modal */}
      {viewType === "contract" && selectedContract && (() => {
        const modalNextStatus = getNextStatus(selectedContract.status);
        const modalCanRevoke = selectedContract.status === "created" || selectedContract.status === "sent";
        const modalIsRevoked = selectedContract.status === "revoked";
        const modalIsLocked = selectedContract.status === "locked";
        
        return (
          <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Manage Contract Status</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedContract.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Current Status</h3>
                  <Badge variant={getStatusVariant(selectedContract.status)} className="text-base px-4 py-2">
                    {getStatusLabel(selectedContract.status)}
                  </Badge>
                </div>

                {modalIsRevoked && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-base text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                    This contract has been revoked and cannot proceed further.
                  </div>
                )}

                {modalIsLocked && (
                  <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-base text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                    This contract is locked and cannot be modified.
                  </div>
                )}

                {!modalIsRevoked && !modalIsLocked && (
                  <>
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Status Flow</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {STATUS_ORDER.map((status, index) => {
                          const isCurrent = selectedContract.status === status;
                          const isPast = STATUS_ORDER.indexOf(selectedContract.status) > index;

                          return (
                            <div key={status} className="flex items-center">
                              <div
                                className={`rounded-xl px-4 py-2.5 text-base font-medium transition-all ${
                                  isCurrent
                                    ? "bg-primary/20 text-primary border border-primary/30 shadow-md"
                                    : isPast
                                    ? "bg-muted/50 text-muted-foreground border border-border/50"
                                    : "bg-background text-muted-foreground border border-border/50"
                                }`}
                              >
                                {getStatusLabel(status)}
                              </div>
                              {index < STATUS_ORDER.length - 1 && (
                                <ArrowRight className="mx-2 h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {modalNextStatus && (
                        <Button
                          size="lg"
                          onClick={() => handleStatusSelect(modalNextStatus)}
                          className="w-full"
                        >
                          Advance to {getStatusLabel(modalNextStatus)}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}

                      {modalCanRevoke && (
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={handleRevoke}
                          className="w-full"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Revoke Contract
                        </Button>
                      )}

                      {!modalNextStatus && !modalCanRevoke && (
                        <p className="text-base text-muted-foreground">
                          No further actions available for this contract.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </section>
  );
}

