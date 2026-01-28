"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { PageLayout } from "@/components/shared/page-layout";
import { ContractsPageHeader } from "@/components/contracts/contracts-page-header";
import { ContractCreationCard } from "@/components/contracts/contract-creation-card";

export default function ContractsPage() {
  const { blueprints, addContract, deleteContract } = useStore();
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [contractName, setContractName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  const handleCreate = async () => {
    if (!selectedBlueprint || !contractName.trim() || isCreating) {
      if (!selectedBlueprint || !contractName.trim()) {
        addToast({
          title: "Validation Error",
          description: "Please select a blueprint and provide a contract name.",
          variant: "error",
        });
      }
      return;
    }

    setIsCreating(true);
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
      setIsCreating(false);
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

  return (
    <PageLayout isLoading={isInitialLoad} loadingText="Loading contracts...">
      <div className="space-y-6 sm:space-y-8">
        <ContractsPageHeader />

        <section className="py-6 sm:py-8">
          <ContractCreationCard
            blueprints={blueprints}
            selectedBlueprintId={selectedBlueprintId}
            contractName={contractName}
            isCreating={isCreating}
            onBlueprintChange={setSelectedBlueprintId}
            onContractNameChange={setContractName}
            onClear={() => {
              setContractName("");
              setSelectedBlueprintId("");
            }}
            onSubmit={handleCreate}
          />
        </section>
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
    </PageLayout>
  );
}

