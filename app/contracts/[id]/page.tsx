"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  canTransitionTo,
  getNextStatus,
  getStatusLabel,
} from "@/lib/contract-utils";
import { format } from "date-fns";
import { Pencil, ArrowRight, X, PenSquare, Lock, Ban, Download } from "lucide-react";
import type { Field } from "@/types/field";
import type { ContractStatus } from "@/types/contract";
import { DocumentRenderer } from "@/components/document-renderer";
import { PdfContractEditor } from "@/components/pdf-contract-editor";
import { capitalizeWords } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { InlineLoader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageLayout } from "@/components/shared/page-layout";
import { generateContractPdf, downloadPdfBlob, safeFilename, getDownloadWarnings } from "@/lib/generate-contract-pdf";

const STATUS_FLOW: ContractStatus[] = [
  "created",
  "approved",
  "sent",
  "signed",
  "locked",
];

function ContractViewPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getContract, updateContract, updateContractStatus } = useStore();
  const { addToast } = useToast();
  const contract = getContract(params.id as string);

  // Initialize hooks before any early returns
  const [localFieldValues, setLocalFieldValues] = useState(contract?.fieldValues || {});
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
  }>({ overlappingFieldLabels: [], unfilledFieldLabels: [] });

  const isEditMode = searchParams.get("edit") === "true";
  const isCreated = contract?.status === "created";
  const isLocked = contract?.status === "locked";
  const isRevoked = contract?.status === "revoked";
  // Only allow editing if explicitly in edit mode AND status is "created"
  const canEdit = isEditMode && isCreated;

  // Listen for storage quota warnings
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

  // Wait for initial store hydration before showing "not found"
  useEffect(() => {
    // Give store time to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update local state when contract changes (only if not in edit mode or no unsaved changes)
  useEffect(() => {
    if (!contract) return;
    // Only sync if we're not in edit mode, or if we're in edit mode but have no unsaved changes
    if (!canEdit || !hasUnsavedChanges) {
      setLocalFieldValues(contract.fieldValues);
      setLocalFields(contract.fields);
      setHasUnsavedChanges(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.id]);

  // Show loading during initial load to prevent "not found" flash and layout shifts
  if (isInitialLoad) {
    return (
      <PageLayout isLoading={true} loadingText="Loading contract...">
        <div></div>
      </PageLayout>
    );
  }

  // Only show "not found" after initial load is complete
  if (!contract) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
              <p className="mb-4">The contract you are looking for does not exist.</p>
              <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
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
      // Update contract immediately (Zustand operations are synchronous)
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
    } catch (error: any) {
      setIsSaving(false);
      // Handle storage quota errors
      if (error?.name === "QuotaExceededError" || error?.message?.includes("quota")) {
        addToast({
          title: "Storage Full",
          description: error.message || 
            "Storage quota exceeded. Please delete some old contracts or blueprints to free up space.",
          variant: "error",
        });
      } else {
        // Handle other errors
        addToast({
          title: "Error Saving Contract",
          description: error?.message || "An error occurred while saving the contract.",
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
      const bytes = await generateContractPdf({
        pdfUrl: contract.pdfUrl,
        fields: fieldsToUse,
        fieldValues: valuesToUse,
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

  const handleDownloadContract = () => {
    if (!contract?.pdfUrl || isDownloading) return;
    const fieldsToUse = canEdit ? localFields : contract.fields;
    const valuesToUse = canEdit ? localFieldValues : contract.fieldValues;
    const warnings = getDownloadWarnings(fieldsToUse, valuesToUse);
    const hasOverlapping = warnings.overlappingFieldLabels.length > 0;
    const hasUnfilled = warnings.unfilledFieldLabels.length > 0;
    if (hasOverlapping || hasUnfilled) {
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

  // Status management handlers
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
        {/* Header: contract identity + mode (edit / read-only) in one section */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <section className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-card overflow-hidden">
            {/* Top: name, blueprint, status, edit button */}
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight break-words">
                      <span className="text-primary">{capitalizeWords(contract.name)}</span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed break-words">
                      Blueprint: {contract.blueprintName}
                    </p>
                  </div>
                  <div className="flex flex-col min-[480px]:flex-row gap-2 sm:gap-3 w-full sm:w-auto shrink-0 sm:items-end">
                    {!canEdit && isCreated && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => router.push(`/contracts/${contract.id}?edit=true`)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6"
                      >
                        <Pencil className="h-4 w-4 shrink-0" />
                        Edit
                      </Button>
                    )}
                    <Badge
                      variant={getStatusVariant(contract.status)}
                      className="flex items-center justify-center text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto shrink-0 self-start sm:self-auto"
                    >
                      {getStatusLabel(contract.status)}
                    </Badge>
                  </div>
                </div>

                {/* Edit mode strip: same card, below title row */}
                {canEdit && (
                  <div
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 px-3 py-2.5 sm:px-4 sm:py-3"
                    aria-label="Edit mode notice"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-primary/15 dark:bg-primary/25">
                        <PenSquare className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary" aria-hidden />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground sm:text-base">Edit mode</span>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          Change fields and metadata, then click <strong>Update</strong> to save.
                        </p>
                      </div>
                    </div>
                    {hasUnsavedChanges && (
                      <span
                        className="inline-flex items-center rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ml-auto shrink-0"
                        role="status"
                      >
                        Unsaved changes
                      </span>
                    )}
                  </div>
                )}

                {/* Read-only strip: same card, when not created */}
                {!canEdit && !isCreated && (
                  <div
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 px-3 py-2.5 sm:px-4 sm:py-3"
                    aria-label="Read-only notice"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-gray-200/80 dark:bg-gray-700/80">
                        <Lock className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground" aria-hidden />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground sm:text-base">Read-only</span>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          Editing is only available for contracts in <strong>Created</strong> status.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-auto shrink-0">
                      {isLocked && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-200/80 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/80 dark:text-gray-300">
                          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          Locked
                        </span>
                      )}
                      {isRevoked && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-500/20 dark:text-red-400">
                          <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          Revoked
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Document - PDF or Form-based */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <div className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-card p-4 sm:p-6 md:p-8 overflow-hidden">
            {contract.pdfUrl ? (
              <PdfContractEditor
                pdfUrl={contract.pdfUrl}
                fields={canEdit ? localFields : contract.fields}
                fieldValues={canEdit ? localFieldValues : contract.fieldValues}
                isEditable={canEdit}
                onFieldChange={canEdit ? handleFieldChange : undefined}
                onFieldsReorder={canEdit ? handleFieldsReorder : undefined}
              />
            ) : (
              <DocumentRenderer
                title={contract.name}
                sections={[]}
                fields={canEdit ? localFields : contract.fields}
                fieldValues={canEdit ? localFieldValues : contract.fieldValues}
                isEditable={canEdit}
                onFieldChange={canEdit ? handleFieldChange : undefined}
                onFieldsReorder={canEdit ? handleFieldsReorder : undefined}
              />
            )}
          </div>
        </section>

        {/* Actions & meta */}
        <section className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-card p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs sm:text-sm md:text-base text-muted-foreground break-words order-2 sm:order-1">
              Created: {format(new Date(contract.createdAt), "MMM d, yyyy")}
            </div>
            <div className="flex flex-col min-[480px]:flex-row gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2 flex-wrap">
              {contract.pdfUrl && (
                <Button
                  size="lg"
                  onClick={handleDownloadContract}
                  disabled={isDownloading}
                  className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6 flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <InlineLoader size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 shrink-0" />
                      Download Contract
                    </>
                  )}
                </Button>
              )}
              {canEdit ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setLocalFieldValues(contract.fieldValues);
                      setLocalFields(contract.fields);
                      setHasUnsavedChanges(false);
                      router.push(`/contracts/${contract.id}`);
                    }}
                    className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleSave}
                    className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8"
                    disabled={!hasUnsavedChanges || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <InlineLoader size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setStatusModalOpen(true)}
                  className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8"
                  disabled={isStatusChanging}
                >
                  {isStatusChanging ? (
                    <>
                      <InlineLoader size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Manage Status"
                  )}
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Status Management Modal */}
      {contract && (() => {
        const modalNextStatus = getNextStatus(contract.status);
        const modalCanRevoke = contract.status === "created" || contract.status === "sent";
        const modalIsRevoked = contract.status === "revoked";
        const modalIsLocked = contract.status === "locked";
        
        return (
          <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
            <DialogContent className="max-w-xs sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl md:text-2xl">Manage Contract Status</DialogTitle>
                <DialogDescription className="text-sm sm:text-base break-words">
                  {contract.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
                <div>
                  <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">Current Status</h3>
                  <Badge variant={getStatusVariant(contract.status)} className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                    {getStatusLabel(contract.status)}
                  </Badge>
                </div>

                {modalIsRevoked && (
                  <div className="rounded-lg sm:rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4 text-sm sm:text-base text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                    This contract has been revoked and cannot proceed further.
                  </div>
                )}

                {modalIsLocked && (
                  <div className="rounded-lg sm:rounded-xl bg-green-50 border border-green-200 p-3 sm:p-4 text-sm sm:text-base text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                    This contract is locked and cannot be modified.
                  </div>
                )}

                {!modalIsRevoked && !modalIsLocked && (
                  <>
                    <div>
                      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Status Flow</h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
                        {STATUS_FLOW.map((status, index) => {
                          const isCurrent = contract.status === status;
                          const isPast = STATUS_FLOW.indexOf(contract.status) > index;

                          return (
                            <div key={status} className="flex items-center">
                              <div
                                className={`rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-base font-medium transition-all ${
                                  isCurrent
                                    ? "bg-primary/20 text-primary border border-primary/30 shadow-md"
                                    : isPast
                                    ? "bg-muted/50 text-muted-foreground border border-border/50"
                                    : "bg-background text-muted-foreground border border-border/50"
                                }`}
                              >
                                {getStatusLabel(status)}
                              </div>
                              {index < STATUS_FLOW.length - 1 && (
                                <ArrowRight className="mx-1 sm:mx-2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {modalNextStatus && (
                        <Button
                          size="lg"
                          onClick={() => handleStatusChange(modalNextStatus)}
                          className="w-full text-sm sm:text-base"
                          disabled={isStatusChanging}
                        >
                          {isStatusChanging ? (
                            <>
                              <InlineLoader size="sm" className="mr-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              Advance to {getStatusLabel(modalNextStatus)}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}

                      {modalCanRevoke && (
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={handleRevoke}
                          className="w-full text-sm sm:text-base"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Revoke Contract
                        </Button>
                      )}

                      {!modalNextStatus && !modalCanRevoke && (
                        <p className="text-sm sm:text-base text-muted-foreground">
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

      {/* Revoke Confirmation Dialog */}
      {contract && (
        <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <DialogContent className="max-w-xs sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Revoke Contract</DialogTitle>
              <DialogDescription className="text-sm sm:text-base break-words">
                Are you sure you want to revoke &quot;{contract.name}&quot;? This action will mark the contract as revoked and it cannot proceed further. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRevokeDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRevoke}
                disabled={isStatusChanging}
                className="w-full sm:w-auto"
              >
                {isStatusChanging ? (
                  <>
                    <InlineLoader size="sm" className="mr-2" />
                    Revoking...
                  </>
                ) : (
                  "Revoke Contract"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Download PDF Warnings Dialog */}
      {contract && (
        <Dialog open={downloadWarningsOpen} onOpenChange={setDownloadWarningsOpen}>
          <DialogContent className="max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Download PDF — Warnings</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                The following issues may affect the downloaded PDF. You can still download, but overlapping or unfilled fields may not display as expected.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {downloadWarnings.overlappingFieldLabels.length > 0 && (
                <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Overlapping fields (will not display correctly on the downloaded PDF):
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                    {downloadWarnings.overlappingFieldLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
              )}
              {downloadWarnings.unfilledFieldLabels.length > 0 && (
                <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Unfilled fields (will not show on the downloaded PDF):
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                    {downloadWarnings.unfilledFieldLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDownloadWarningsOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => performDownload()}
                disabled={isDownloading}
                className="w-full sm:w-auto"
              >
                {isDownloading ? (
                  <>
                    <InlineLoader size="sm" className="mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 shrink-0 mr-2" />
                    Download anyway
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
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

