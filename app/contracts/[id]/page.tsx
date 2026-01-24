"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/contract-utils";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import type { Field } from "@/types/field";
import { DocumentRenderer } from "@/components/document-renderer";
import { capitalizeWords } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";

function ContractViewPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getContract, updateContract, getBlueprint } = useStore();
  const { addToast } = useToast();
  const contract = getContract(params.id as string);
  const blueprint = contract ? getBlueprint(contract.blueprintId) : undefined;

  // Initialize hooks before any early returns
  const [localFieldValues, setLocalFieldValues] = useState(contract?.fieldValues || {});
  const [localFields, setLocalFields] = useState(contract?.fields || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    router.push("/");
  };

  const getStatusVariant = (status: string) => {
    if (status === "signed" || status === "locked") return "success";
    if (status === "revoked") return "destructive";
    if (status === "created") return "secondary";
    return "default";
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-0 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold break-words">
                {capitalizeWords(contract.name)}
              </h1>
              <p className="mt-2 break-words">
                Blueprint: {contract.blueprintName}
              </p>
            </div>
            <Badge variant={getStatusVariant(contract.status)} className="flex-shrink-0">
              {getStatusLabel(contract.status)}
            </Badge>
          </div>
        </div>

        {/* Edit Mode Info */}
        {canEdit && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Edit Contract</CardTitle>
              <p className="text-sm text-blue-600 break-words mt-2">
                You are in edit mode. Click Update to save your changes.
                {hasUnsavedChanges && (
                  <span className="ml-2 text-orange-600 font-medium">• Unsaved changes</span>
                )}
              </p>
            </CardHeader>
          </Card>
        )}
        {!canEdit && !isCreated && (
          <Card className="mb-6">
            <CardHeader>
              <p className="text-sm text-gray-600 break-words">
                This contract is in read-only mode. Editing is only available for contracts in Created status.
              </p>
              {isLocked && (
                <p className="text-sm break-words mt-2">
                  This contract is locked and cannot be edited.
                </p>
              )}
              {isRevoked && (
                <p className="text-sm text-red-600 break-words mt-2">
                  This contract has been revoked.
                </p>
              )}
            </CardHeader>
          </Card>
        )}

        {/* Document Renderer */}
        <div className="mb-8">
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
        </div>

        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="text-sm break-words">
            Created: {format(new Date(contract.createdAt), "MMM d, yyyy")}
          </div>
          <div className="flex gap-2">
            {canEdit ? (
              <>
                <Button
                  variant="outline"
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
                  onClick={handleSave}
                  className="flex-shrink-0"
                  disabled={!hasUnsavedChanges}
                >
                  Update
                </Button>
              </>
            ) : (
              <>
                {isCreated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/contracts/${contract.id}?edit=true`)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/contracts/${contract.id}/status`)}
                  className="flex-shrink-0"
                >
                  Manage Status
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
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

