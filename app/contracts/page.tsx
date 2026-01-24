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
      <div className="relative overflow-hidden from-primary/5 via-background to-secondary/30">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <section className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight">
                    <span className="text-primary">Contracts</span>
                  </h1>
                  <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
                    Manage and track all your contracts
                  </p>
                </div>
                <Link href="/contracts/new" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    New Contract
                  </Button>
                </Link>
              </div>
            </section>

            {/* Search and Filters */}
            {contracts.length > 0 && (
              <section className="py-6 sm:py-8">
                <Card className="group relative overflow-visible">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 rounded-2xl sm:rounded-3xl" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-xl sm:text-2xl">Search & Filter Contracts</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Find contracts by name or filter by status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-20">
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
              </section>
            )}

            {/* Contracts List Section */}
            <section className="py-6 sm:py-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl px-2">
                  {selectedStatuses.length === 0
                    ? "All Contracts"
                    : selectedStatuses.length === 1
                    ? `${getStatusLabel(selectedStatuses[0])} Contracts`
                    : "Filtered Contracts"}
                </h2>
                <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
                  {filteredContracts.length === 0
                    ? "No contracts found"
                    : `Showing ${filteredContracts.length} contract${filteredContracts.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {filteredContracts.length === 0 ? (
                <Card className="rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <p className="text-base sm:text-lg text-muted-foreground">
                      {searchQuery || selectedStatuses.length > 0
                        ? "No contracts match your search or filter criteria."
                        : "No contracts found."}
                    </p>
                    {!searchQuery && selectedStatuses.length === 0 && contracts.length === 0 && (
                      <Link
                        href="/contracts/new"
                        className="mt-4 inline-block"
                      >
                        <Button size="lg">
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
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
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
            </section>
          </div>
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

