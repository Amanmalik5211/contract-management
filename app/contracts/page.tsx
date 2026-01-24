"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStatusLabel } from "@/lib/contract-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContractStatus } from "@/types/contract";
import { useToast } from "@/components/ui/toaster";
import { ContractCard } from "@/components/contracts/contract-card";
import { SearchAndFilter } from "@/components/shared/search-and-filter";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Plus } from "lucide-react";

export default function ContractsPage() {
  const { contracts, deleteContract } = useStore();
  const router = useRouter();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ContractStatus[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<{ id: string; name: string } | null>(null);

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

  const handleEdit = (contractId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/contracts/${contractId}?edit=true`);
    addToast({
      title: "Opening Editor",
      description: "Contract editor opened. Make your changes and click Update to save.",
      variant: "default",
    });
  };

  const handleDelete = (contractId: string, contractName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContractToDelete({ id: contractId, name: contractName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContract(contractToDelete.id);
      addToast({
        title: "Contract Deleted",
        description: `"${contractToDelete.name}" has been deleted successfully.`,
        variant: "success",
      });
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
              <p className="mt-2 text-muted-foreground">Manage and track all your contracts</p>
            </div>
            <Link href="/contracts/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Contract
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          {contracts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <SearchAndFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedFilters={selectedStatuses}
                  onFilterToggle={(status) => {
                    setSelectedStatuses((prev) =>
                      prev.includes(status)
                        ? prev.filter((s) => s !== status)
                        : [...prev, status]
                    );
                  }}
                onClearFilters={() => {
                  setSelectedStatuses([]);
                  setSearchQuery("");
                }}
                filterOptions={statusFilterOptions}
                searchPlaceholder="Search contracts..."
                filterLabel="Filters"
              />
              </CardContent>
            </Card>
          )}

          {/* Contracts List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedStatuses.length === 0
                  ? "All Contracts"
                  : selectedStatuses.length === 1
                  ? `${getStatusLabel(selectedStatuses[0])} Contracts`
                  : "Filtered Contracts"}
              </CardTitle>
              <CardDescription>
                {filteredContracts.length === 0
                  ? "No contracts found"
                  : `Showing ${filteredContracts.length} contract${filteredContracts.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredContracts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery || selectedStatuses.length > 0
                      ? "No contracts match your search or filter criteria."
                      : "No contracts found."}
                  </p>
                  {!searchQuery && selectedStatuses.length === 0 && contracts.length === 0 && (
                    <Link
                      href="/contracts/new"
                      className="mt-4 inline-block"
                    >
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first contract
                      </Button>
                    </Link>
                  )}
                  {(searchQuery || selectedStatuses.length > 0) && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStatuses([]);
                          setSearchQuery("");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContracts.map((contract) => {
                    const canEdit = contract.status === "created";
                    const canDelete = contract.status === "created" || contract.status === "revoked";
                    
                    return (
                      <ContractCard
                        key={contract.id}
                        contract={contract}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    );
                  })}
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
          if (!open) setContractToDelete(null);
        }}
        itemName={contractToDelete?.name || ""}
        itemType="contract"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

