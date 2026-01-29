"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  canTransitionTo,
  getStatusLabel,
} from "@/lib/contract-utils";
import type { Field } from "@/types/field";
import type { ContractStatus } from "@/types/contract";
import { useToast } from "@/components/ui/toaster";
import { PageLayout } from "@/components/shared/page-layout";
import { generateContractPdf, downloadPdfBlob, safeFilename, getDownloadWarnings } from "@/lib/generate-contract-pdf";
import { getPdfjsLib } from "@/components/pdf-contract-editor/pdf-utils";
import { ContractHeader } from "@/components/contracts/contract-header";
import { ContractDocumentSection } from "@/components/contracts/contract-document-section";
import { ContractActionsSection } from "@/components/contracts/contract-actions-section";
import { StatusManagementModal } from "@/components/contracts/status-management-modal";
import { RevokeConfirmationDialog } from "@/components/contracts/revoke-confirmation-dialog";
import { DownloadWarningsDialog } from "@/components/contracts/download-warnings-dialog";
import { ContractNotFound } from "@/components/contracts/contract-not-found";
import { format } from "date-fns";

function ContractViewPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getContract, updateContract, updateContractStatus } = useStore();
  const { addToast } = useToast();
  const contractId = Array.isArray(params.id) ? params.id[0] : params.id;
  const contract = typeof contractId === "string" ? getContract(contractId) : undefined;

  const [localFieldValues, setLocalFieldValues] = useState<Record<string, string | boolean | Date | null>>(contract?.fieldValues || {});
  const [localFields, setLocalFields] = useState(contract?.fields || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [downloadWarningsOpen, setDownloadWarningsOpen] = useState(false);
  const [downloadWarnings, setDownloadWarnings] = useState<{
    overlappingFieldLabels: string[];
    unfilledFieldLabels: string[];
    fieldsOverlappingPdfTextLabels: string[];
  }>({ overlappingFieldLabels: [], unfilledFieldLabels: [], fieldsOverlappingPdfTextLabels: [] });

  const isEditMode = searchParams.get("edit") === "true";
  const isCreated = contract?.status === "created";
  const isLocked = contract?.status === "locked";
  const isRevoked = contract?.status === "revoked";
  const canEdit = isEditMode && isCreated;

  useEffect(() => {
    const handleStorageWarning = (event: CustomEvent) => {
      addToast({
        title: "Storage Warning",
        description: event.detail.message,
        variant: "warning",
      });
    };

    const handleStorageError = (event: CustomEvent) => {
      addToast({
        title: "Storage Error",
        description: event.detail.message,
        variant: "error",
      });
    };

    window.addEventListener("storage-quota-warning", handleStorageWarning as EventListener);
    window.addEventListener("storage-quota-error", handleStorageError as EventListener);

    return () => {
      window.removeEventListener("storage-quota-warning", handleStorageWarning as EventListener);
      window.removeEventListener("storage-quota-error", handleStorageError as EventListener);
    };
  }, [addToast]);

  useEffect(() => {
    const persistApi = (useStore as unknown as { persist?: { hasHydrated?: () => boolean; onFinishHydration?: (cb: () => void) => () => void } }).persist;
    const hasHydrated = persistApi?.hasHydrated?.() ?? true;
    if (hasHydrated) {
      setIsInitialLoad(false);
      return;
    }
    const unsubscribe = persistApi?.onFinishHydration?.(() => {
      setIsInitialLoad(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!contract) return;
    if (!canEdit || !hasUnsavedChanges) {
      setLocalFieldValues(contract.fieldValues);
      setLocalFields(contract.fields);
      setHasUnsavedChanges(false);
    }
  }, [contract?.id]);

  if (isInitialLoad) {
    return (
      <PageLayout isLoading={true} loadingText="Loading contract...">
        <div></div>
      </PageLayout>
    );
  }

  if (!contract) {
    return (
      <PageLayout>
        <ContractNotFound />
      </PageLayout>
    );
  }

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    if (!canEdit) return;

    setLocalFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleFieldsReorder = (reorderedFields: Field[]) => {
    if (!canEdit) return;

    setLocalFields(reorderedFields);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!canEdit || isSaving) return;

    setIsSaving(true);
    try {
      updateContract(contract.id, {
        fieldValues: localFieldValues,
        fields: localFields,
      });
      setHasUnsavedChanges(false);
      addToast({
        title: "Contract Updated",
        description: `"${contract.name}" has been updated successfully.`,
        variant: "success",
      });
      setIsSaving(false);
      router.push("/dashboard");
    } catch (error: unknown) {
      setIsSaving(false);
      const errorMessage = error instanceof Error ? error.message : 
        (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") 
          ? error.message 
          : undefined;
      const errorName = error instanceof DOMException ? error.name :
        (typeof error === "object" && error !== null && "name" in error && typeof error.name === "string")
          ? error.name
          : undefined;
      
      if (errorName === "QuotaExceededError" || errorMessage?.includes("quota")) {
        addToast({
          title: "Storage Full",
          description: errorMessage || 
            "Storage quota exceeded. Please delete some old contracts or blueprints to free up space.",
          variant: "error",
        });
      } else {
        addToast({
          title: "Error Saving Contract",
          description: errorMessage || "An error occurred while saving the contract.",
          variant: "error",
        });
      }
    }
  };

  const performDownload = async () => {
    if (!contract?.pdfUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      const fieldsToUse = canEdit ? localFields : contract.fields;
      const valuesToUse = canEdit ? localFieldValues : contract.fieldValues;
      
      const pdfjsLib = await getPdfjsLib();
      
      const bytes = await generateContractPdf({
        pdfUrl: contract.pdfUrl,
        fields: fieldsToUse,
        fieldValues: valuesToUse,
        skipOverlappingPdfText: false,
        pdfjsLib: pdfjsLib || undefined,
      });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const base = safeFilename(contract.name);
      const filename = `${base}_${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`;
      downloadPdfBlob(blob, filename);
      addToast({
        title: "Contract Downloaded",
        description: "Your contract has been downloaded as a PDF.",
        variant: "success",
      });
      setDownloadWarningsOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate PDF.";
      addToast({
        title: "Download Failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadContract = async () => {
    if (!contract?.pdfUrl || isDownloading) return;
    const fieldsToUse = canEdit ? localFields : contract.fields;
    const valuesToUse = canEdit ? localFieldValues : contract.fieldValues;
    
    const pdfjsLib = await getPdfjsLib();
    const warnings = await getDownloadWarnings(
      fieldsToUse,
      valuesToUse,
      contract.pdfUrl,
      pdfjsLib || undefined
    );
    
    const hasOverlapping = warnings.overlappingFieldLabels.length > 0;
    const hasUnfilled = warnings.unfilledFieldLabels.length > 0;
    const hasOverlappingPdfText = warnings.fieldsOverlappingPdfTextLabels && warnings.fieldsOverlappingPdfTextLabels.length > 0;
    if (hasOverlapping || hasUnfilled || hasOverlappingPdfText) {
      setDownloadWarnings(warnings);
      setDownloadWarningsOpen(true);
      return;
    }
    performDownload();
  };

  const getStatusVariant = (status: string) => {
    if (status === "signed" || status === "locked") return "success";
    if (status === "revoked") return "destructive";
    if (status === "created") return "secondary";
    return "default";
  };

  const handleStatusChange = async (newStatus: ContractStatus) => {
    if (!contract || isStatusChanging) return;
    if (canTransitionTo(contract.status, newStatus)) {
      setIsStatusChanging(true);
      try {
        updateContractStatus(contract.id, newStatus);
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

  const handleRevoke = () => {
    if (!contract) return;
    if (contract.status === "created" || contract.status === "sent") {
      setRevokeDialogOpen(true);
    }
  };

  const confirmRevoke = async () => {
    if (!contract || isStatusChanging) return;
    if (contract.status === "created" || contract.status === "sent") {
      setIsStatusChanging(true);
      try {
        updateContractStatus(contract.id, "revoked");
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

  return (
    <PageLayout isLoading={isInitialLoad} loadingText="Loading contract...">
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <ContractHeader
            contract={contract}
            canEdit={canEdit}
            isCreated={isCreated}
            isLocked={isLocked}
            isRevoked={isRevoked}
            hasUnsavedChanges={hasUnsavedChanges}
            getStatusVariant={getStatusVariant}
          />
        </div>

        <ContractDocumentSection
          contract={contract}
                fields={canEdit ? localFields : contract.fields}
                fieldValues={canEdit ? localFieldValues : contract.fieldValues}
                isEditable={canEdit}
                onFieldChange={canEdit ? handleFieldChange : undefined}
                onFieldsReorder={canEdit ? handleFieldsReorder : undefined}
              />

        <ContractActionsSection
          contract={contract}
          canEdit={canEdit}
          isSaving={isSaving}
          isDownloading={isDownloading}
          isStatusChanging={isStatusChanging}
          hasUnsavedChanges={hasUnsavedChanges}
          onCancel={() => {
                      setLocalFieldValues(contract.fieldValues);
                      setLocalFields(contract.fields);
                      setHasUnsavedChanges(false);
                      router.push(`/contracts/${contract.id}`);
                    }}
          onSave={handleSave}
          onDownload={handleDownloadContract}
          onManageStatus={() => setStatusModalOpen(true)}
        />
      </div>

      <StatusManagementModal
        open={statusModalOpen}
        contractName={contract.name}
        status={contract.status}
        isStatusChanging={isStatusChanging}
        getStatusVariant={getStatusVariant}
        onOpenChange={setStatusModalOpen}
        onStatusChange={handleStatusChange}
        onRevoke={handleRevoke}
      />

      <RevokeConfirmationDialog
        open={revokeDialogOpen}
        contractName={contract.name}
        onOpenChange={setRevokeDialogOpen}
        onConfirm={confirmRevoke}
      />

      <DownloadWarningsDialog
        open={downloadWarningsOpen}
        warnings={downloadWarnings}
        isDownloading={isDownloading}
        onOpenChange={setDownloadWarningsOpen}
        onDownload={performDownload}
      />
    </PageLayout>
  );
}

export default function ContractViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      }
    >
      <ContractViewPageContent />
    </Suspense>
  );
}

