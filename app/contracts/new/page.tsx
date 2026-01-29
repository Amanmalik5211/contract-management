"use client";

import { useState, useEffect, useRef, startTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { PageLoader } from "@/components/ui/loader";
import { PageLayout } from "@/components/shared/page-layout";
import { ContractFormHeader } from "@/components/contracts/contract-form-header";
import { NewContractFormCard } from "@/components/contracts/new-contract-form-card";

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { blueprints, addContract } = useStore();
  const { addToast } = useToast();
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [contractName, setContractName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    const blueprintId = searchParams.get("blueprintId");
    if (blueprintId && blueprints.find((bp) => bp.id === blueprintId)) {
      startTransition(() => {
        setSelectedBlueprintId(blueprintId);
      });
      initializedRef.current = true;
    }
  }, [searchParams, blueprints]);

  const selectedBlueprint = blueprints.find(
    (bp) => bp.id === selectedBlueprintId
  );

  const handleCreate = async () => {
    if (!selectedBlueprint || !contractName.trim()) {
      addToast({
        title: "Validation Error",
        description: "Please select a blueprint and provide a contract name.",
        variant: "error",
      });
      return;
    }

    if (isCreating) return;

    setIsCreating(true);
    try {
      const contract = {
        id: `contract-${generateUUID()}`,
        name: contractName,
        blueprintId: selectedBlueprint.id,
        blueprintName: selectedBlueprint.name,
        status: "created" as const,
        fields: selectedBlueprint.fields.map((f, index) => ({
          ...f,
          position: index,
        })), // Copy fields with position
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

  return (
    <PageLayout isLoading={isInitialLoad} loadingText="Loading...">
      <div className="w-full max-w-full overflow-x-hidden">
        <ContractFormHeader />

        <section>
          <NewContractFormCard
            blueprints={blueprints}
            selectedBlueprintId={selectedBlueprintId}
            contractName={contractName}
            isCreating={isCreating}
            onBlueprintChange={setSelectedBlueprintId}
            onContractNameChange={setContractName}
            onSubmit={handleCreate}
          />
        </section>
      </div>
    </PageLayout>
  );
}

export default function NewContractPage() {
  return (
    <Suspense fallback={
      <PageLoader text="Loading contract form..." />
    }>
      <NewContractForm />
    </Suspense>
  );
}

