"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusLabel } from "@/lib/contract-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContractStatus } from "@/types/contract";
import { useToast } from "@/components/ui/toaster";
import { ContractCard } from "@/components/contracts/contract-card";
import { StatusOverviewCards } from "@/components/dashboard/status-overview-cards";
import { SearchAndFilter } from "@/components/shared/search-and-filter";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";

export default function Dashboard() {
  const { contracts, blueprints, deleteContract } = useStore();
  const router = useRouter();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ContractStatus[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<{ id: string; name: string } | null>(null);

  // Calculate status counts
  const statusCounts = {
    created: contracts.filter((c) => c.status === "created").length,
    approved: contracts.filter((c) => c.status === "approved").length,
    sent: contracts.filter((c) => c.status === "sent").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    locked: contracts.filter((c) => c.status === "locked").length,
    revoked: contracts.filter((c) => c.status === "revoked").length,
  };

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
      <div className="mx-auto max-w-7xl px-0 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of your contracts and templates</p>
        </div>

        <StatusOverviewCards
          totalBlueprints={blueprints.length}
          totalContracts={contracts.length}
          statusCounts={statusCounts}
        />

        {/* Search and Filters */}
        <Card className="mb-8">
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
            <p className="text-sm mt-1">
              {filteredContracts.length === 0
                ? "No contracts found"
                : `Showing ${filteredContracts.length} contract${filteredContracts.length !== 1 ? "s" : ""}`}
            </p>
          </CardHeader>
          <CardContent>
            {filteredContracts.length === 0 ? (
              <div className="py-12 text-center">
                <p>
                  {searchQuery || selectedStatuses.length > 0
                    ? "No contracts match your search or filter criteria."
                    : "No contracts found."}
                </p>
                {!searchQuery && selectedStatuses.length === 0 && (
                  <Link
                    href="/contracts/new"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Create your first contract
                  </Link>
                )}
                {(searchQuery || selectedStatuses.length > 0) && (
                  <div className="mt-4">
                    <button
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      onClick={() => {
                        setSelectedStatuses([]);
                        setSearchQuery("");
                      }}
                    >
                      Clear Filters
                    </button>
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

