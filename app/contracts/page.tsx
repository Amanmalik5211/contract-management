"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { PageLayout } from "@/components/shared/page-layout";
import { ContractCreationCard } from "@/components/contracts/contract-creation-card";
import { ContractCard } from "@/components/contracts/contract-card";
import { BlueprintCard } from "@/components/blueprints/blueprint-card";
import { StatusManagementModal } from "@/components/contracts/status-management-modal";
import { RevokeConfirmationDialog } from "@/components/contracts/revoke-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { canTransitionTo, getStatusLabel } from "@/lib/contract-utils";
import type { Contract, ContractStatus } from "@/types/contract";

export default function ContractsPage() {
  const { blueprints, contracts, addContract, deleteContract, updateContractStatus } = useStore();
  const router = useRouter();
  const { addToast } = useToast();
  
  // State for Creation
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [contractName, setContractName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [creationStep, setCreationStep] = useState<0 | 1>(0); // 0: Select Blueprint, 1: Details

  // State for Deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for Status Management
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedContractForStatus, setSelectedContractForStatus] = useState<Contract | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  
  // State for Loading & Filters
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");

  // Wait for store hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const selectedBlueprint = blueprints.find(
    (bp) => bp.id === selectedBlueprintId
  );

  const startCreation = () => {
    setIsCreatingMode(true);
    setCreationStep(0);
    setSelectedBlueprintId("");
    setContractName("");
  };

  const handleBlueprintSelect = (id: string) => {
    setSelectedBlueprintId(id);
    setCreationStep(1);
  };

  const handleBack = () => {
    if (creationStep === 1) {
      setCreationStep(0);
      setSelectedBlueprintId("");
    } else {
      setIsCreatingMode(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedBlueprint || !contractName.trim() || isSubmitting) {
      if (!selectedBlueprint || !contractName.trim()) {
        addToast({
          title: "Validation Error",
          description: "Please select a blueprint and provide a contract name.",
          variant: "error",
        });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const contract = {
        id: `contract-${generateUUID()}`,
        name: contractName,
        blueprintId: selectedBlueprint.id,
        blueprintName: selectedBlueprint.name,
        status: "created" as const,
        fields: selectedBlueprint.fields.map((f) => ({ ...f })), // Copy fields
        fieldValues: {},
        pdfUrl: selectedBlueprint.pdfUrl, // Copy PDF URL
        pageCount: selectedBlueprint.pageCount, // Copy page count
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addContract(contract);
      addToast({
        title: "Contract Created",
        description: `"${contractName}" has been created successfully.`,
        variant: "success",
      });
      // Navigate immediately
      router.push(`/contracts/${contract.id}?edit=true`);
    } catch {
      setIsSubmitting(false);
      addToast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (contractToDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        deleteContract(contractToDelete.id);
        addToast({
          title: "Contract Deleted",
          description: `"${contractToDelete.name}" has been deleted successfully.`,
          variant: "success",
        });
        setDeleteDialogOpen(false);
        setContractToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Status Management Handlers
  const handleStatusClick = (contract: Contract) => {
    setSelectedContractForStatus(contract);
    setStatusModalOpen(true);
  };

  const getStatusVariant = (status: string) => {
    if (status === "signed" || status === "locked") return "success";
    if (status === "revoked") return "destructive";
    if (status === "created") return "secondary";
    return "default";
  };

  const handleStatusChange = async (newStatus: ContractStatus) => {
    if (!selectedContractForStatus || isStatusChanging) return;
    if (canTransitionTo(selectedContractForStatus.status, newStatus)) {
      setIsStatusChanging(true);
      try {
        updateContractStatus(selectedContractForStatus.id, newStatus);
        addToast({
          title: "Status Updated",
          description: `Contract status changed to "${getStatusLabel(newStatus)}".`,
          variant: "success",
        });
        setStatusModalOpen(false);
      } finally {
        setIsStatusChanging(false);
      }
    }
  };

  const handleRevokeClick = () => {
     if (!selectedContractForStatus) return;
     if (selectedContractForStatus.status === "created" || selectedContractForStatus.status === "sent") {
       setRevokeDialogOpen(true);
     }
  };

  const confirmRevoke = async () => {
    if (!selectedContractForStatus || isStatusChanging) return;
    if (selectedContractForStatus.status === "created" || selectedContractForStatus.status === "sent") {
      setIsStatusChanging(true);
      try {
        updateContractStatus(selectedContractForStatus.id, "revoked");
        addToast({
          title: "Contract Revoked",
          description: "Contract has been revoked successfully.",
          variant: "warning",
        });
        setRevokeDialogOpen(false);
        setStatusModalOpen(false);
      } finally {
        setIsStatusChanging(false);
      }
    }
  };
  
  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "All" || 
                          (filter === "Active" && (c.status === "signed" || c.status === "locked")) || 
                          (filter === "Pending" && (c.status === "created" || c.status === "approved" || c.status === "sent")) ||
                          (filter === "Revoked" && c.status === "revoked"); 
    return matchesSearch && matchesFilter;
  });

  return (
    <PageLayout isLoading={isInitialLoad} loadingText="Loading contracts...">
      <div className="space-y-6 sm:space-y-8">
        
        {!isCreatingMode ? (
          <>
            {/* List View Header */}
            <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contracts</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Manage and track all your contracts
                </p>
              </div>
              <Button onClick={startCreation} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Create Contract
              </Button>
            </section>

             {/* Toolbar */}
             <section className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex bg-muted/50 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                   {["All", "Active", "Pending", "Revoked"].map((f) => (
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
                    placeholder="Search contracts..." 
                    className="pl-9 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
             </section>

             {/* Grid */}
             <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContracts.length > 0 ? (
                  filteredContracts.map(c => (
                    <ContractCard 
                       key={c.id} 
                       contract={c}
                       onStatusClick={() => handleStatusClick(c)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                     <p>No contracts found.</p>
                  </div>
                )}
             </section>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
               <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
               </Button>
               <h2 className="text-2xl font-semibold">
                  {creationStep === 0 ? "Select Blueprint" : "Contract Details"}
               </h2>
            </div>
            
            <section className="py-6 sm:py-8">
              {creationStep === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {blueprints.length > 0 ? (
                        blueprints.map(bp => (
                          <div key={bp.id} onClick={() => handleBlueprintSelect(bp.id)}>
                            <BlueprintCard 
                               blueprint={bp}
                               onClick={() => handleBlueprintSelect(bp.id)}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                           <p>No blueprints available. Create a blueprint first.</p>
                        </div>
                      )}
                  </div>
              ) : (
                  <ContractCreationCard
                    blueprints={blueprints}
                    selectedBlueprintId={selectedBlueprintId}
                    contractName={contractName}
                    isCreating={isSubmitting}
                    onBlueprintChange={setSelectedBlueprintId}
                    onContractNameChange={setContractName}
                    onClear={() => setIsCreatingMode(false)}
                    onSubmit={handleCreate}
                  />
              )}
            </section>
          </>
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setDeleteDialogOpen(open);
            if (!open) setContractToDelete(null);
          }
        }}
        itemName={contractToDelete?.name || ""}
        itemType="contract"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
      
      {selectedContractForStatus && (
        <>
          <StatusManagementModal
            open={statusModalOpen}
            contractName={selectedContractForStatus.name}
            status={selectedContractForStatus.status}
            isStatusChanging={isStatusChanging}
            getStatusVariant={getStatusVariant}
            onOpenChange={setStatusModalOpen}
            onStatusChange={handleStatusChange}
            onRevoke={handleRevokeClick}
          />
          <RevokeConfirmationDialog
            open={revokeDialogOpen}
            contractName={selectedContractForStatus.name}
            onOpenChange={setRevokeDialogOpen}
            onConfirm={confirmRevoke}
          />
        </>
      )}

    </PageLayout>
  );
}
