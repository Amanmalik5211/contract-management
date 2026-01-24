"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  canTransitionTo,
  getNextStatus,
  getStatusLabel,
} from "@/lib/contract-utils";
import { format } from "date-fns";
import { Pencil, ArrowRight, X } from "lucide-react";
import type { Field } from "@/types/field";
import type { ContractStatus } from "@/types/contract";
import { DocumentRenderer } from "@/components/document-renderer";
import { capitalizeWords } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const { getContract, updateContract, getBlueprint, updateContractStatus } = useStore();
  const { addToast } = useToast();
  const contract = getContract(params.id as string);
  const blueprint = contract ? getBlueprint(contract.blueprintId) : undefined;

  // Initialize hooks before any early returns
  const [localFieldValues, setLocalFieldValues] = useState(contract?.fieldValues || {});
  const [localFields, setLocalFields] = useState(contract?.fields || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  const isEditMode = searchParams.get("edit") === "true";
  const isCreated = contract?.status === "created";
  const isLocked = contract?.status === "locked";
  const isRevoked = contract?.status === "revoked";
  // Only allow editing if explicitly in edit mode AND status is "created"
  const canEdit = isEditMode && isCreated;

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

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
            <p className="mb-4">The contract you are looking for does not exist.</p>
            <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
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

  const handleSave = () => {
    if (!canEdit) return;

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
    router.push("/dashboard");
  };

  const getStatusVariant = (status: string) => {
    if (status === "signed" || status === "locked") return "success";
    if (status === "revoked") return "destructive";
    if (status === "created") return "secondary";
    return "default";
  };

  // Status management handlers
  const handleStatusChange = (newStatus: ContractStatus) => {
    if (!contract) return;
    if (canTransitionTo(contract.status, newStatus)) {
      updateContractStatus(contract.id, newStatus);
      addToast({
        title: "Status Updated",
        description: `Contract status changed to "${getStatusLabel(newStatus)}".`,
        variant: "success",
      });
      setStatusModalOpen(false);
    }
  };

  const handleRevoke = () => {
    if (!contract) return;
    if (contract.status === "created" || contract.status === "sent") {
      setRevokeDialogOpen(true);
    }
  };

  const confirmRevoke = () => {
    if (!contract) return;
    if (contract.status === "created" || contract.status === "sent") {
      updateContractStatus(contract.id, "revoked");
      addToast({
        title: "Contract Revoked",
        description: "Contract has been revoked successfully.",
        variant: "warning",
      });
      setRevokeDialogOpen(false);
      setStatusModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden from-primary/5 via-background to-secondary/30">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
          <div className="mb-8 sm:mb-12">
            <section className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight break-words">
                    <span className="text-primary">{capitalizeWords(contract.name)}</span>
                  </h1>
                  <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed break-words">
                    Blueprint: {contract.blueprintName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!canEdit && isCreated && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push(`/contracts/${contract.id}?edit=true`)}
                      className="flex items-center gap-2 flex-shrink-0"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Badge variant={getStatusVariant(contract.status)} className="flex-shrink-0 text-sm sm:text-base px-4 py-2">
                    {getStatusLabel(contract.status)}
                  </Badge>
                </div>
              </div>
            </section>
          </div>

          {/* Edit Mode Info */}
          {canEdit && (
            <section className="py-6 sm:py-8 mb-6 sm:mb-8">
              <Card className="group relative overflow-hidden border-gray-400 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 dark:from-primary/20 dark:via-primary/10" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl sm:text-2xl">Edit Contract</CardTitle>
                  <p className="text-sm sm:text-base break-words mt-2 leading-relaxed">
                    You are in edit mode. Click Update to save your changes.
                    {hasUnsavedChanges && (
                      <span className="ml-2 font-medium">• Unsaved changes</span>
                    )}
                  </p>
                </CardHeader>
              </Card>
            </section>
          )}
          {!canEdit && !isCreated && (
            <section className="py-6 sm:py-8 mb-6 sm:mb-8">
              <Card className="group relative overflow-hidden border-gray-300 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 dark:from-primary/10 dark:via-primary/5" />
                <CardHeader className="relative z-10">
                  <p className="text-sm sm:text-base break-words leading-relaxed">
                    This contract is in read-only mode. Editing is only available for contracts in Created status.
                  </p>
                  {isLocked && (
                    <p className="text-sm sm:text-base break-words mt-2">
                      This contract is locked and cannot be edited.
                    </p>
                  )}
                  {isRevoked && (
                    <p className="text-sm sm:text-base break-words mt-2">
                      This contract has been revoked.
                    </p>
                  )}
                </CardHeader>
              </Card>
            </section>
          )}

          {/* Document Renderer */}
          <section className="py-6 sm:py-8 mb-8">
            <DocumentRenderer
              title={contract.name}
              description={contract.blueprintDescription || blueprint?.description}
              headerImageUrl={blueprint?.headerImageUrl}
              sections={blueprint?.sections || []}
              fields={canEdit ? localFields : contract.fields}
              fieldValues={canEdit ? localFieldValues : contract.fieldValues}
              isEditable={canEdit}
              onFieldChange={canEdit ? handleFieldChange : undefined}
              onFieldsReorder={canEdit ? handleFieldsReorder : undefined}
            />
          </section>

          <section className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm sm:text-base break-words">
                Created: {format(new Date(contract.createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex gap-2 sm:gap-3">
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
                      className="flex-shrink-0"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleSave}
                      className="flex-shrink-0"
                      disabled={!hasUnsavedChanges}
                    >
                      Update
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => setStatusModalOpen(true)}
                    className="flex-shrink-0"
                  >
                    Manage Status
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Status Management Modal */}
      {contract && (() => {
        const modalNextStatus = getNextStatus(contract.status);
        const modalCanRevoke = contract.status === "created" || contract.status === "sent";
        const modalIsRevoked = contract.status === "revoked";
        const modalIsLocked = contract.status === "locked";
        
        return (
          <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Manage Contract Status</DialogTitle>
                <DialogDescription className="text-base">
                  {contract.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Current Status</h3>
                  <Badge variant={getStatusVariant(contract.status)} className="text-base px-4 py-2">
                    {getStatusLabel(contract.status)}
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
                        {STATUS_FLOW.map((status, index) => {
                          const isCurrent = contract.status === status;
                          const isPast = STATUS_FLOW.indexOf(contract.status) > index;

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
                              {index < STATUS_FLOW.length - 1 && (
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
                          onClick={() => handleStatusChange(modalNextStatus)}
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

      {/* Revoke Confirmation Dialog */}
      {contract && (
        <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke Contract</DialogTitle>
              <DialogDescription>
                Are you sure you want to revoke &quot;{contract.name}&quot;? This action will mark the contract as revoked and it cannot proceed further. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRevokeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRevoke}
              >
                Revoke Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
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

