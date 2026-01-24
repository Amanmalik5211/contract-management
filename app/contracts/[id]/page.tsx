"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/contract-utils";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import type { Field } from "@/types/field";

function ContractViewPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getContract, updateContract } = useStore();
  const contract = getContract(params.id as string);

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

  const isEditMode = searchParams.get("edit") === "true";
  const isCreated = contract.status === "created";
  const isLocked = contract.status === "locked";
  const isRevoked = contract.status === "revoked";
  // Only allow editing if explicitly in edit mode AND status is "created"
  const canEdit = isEditMode && isCreated;

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    if (!canEdit) return;

    updateContract(contract.id, {
      fieldValues: {
        ...contract.fieldValues,
        [fieldId]: value,
      },
    });
  };

  const renderField = (field: Field) => {
    const value = contract.fieldValues[field.id] ?? "";

    // Render read-only view when not in edit mode
    if (!canEdit) {
      switch (field.type) {
        case "text":
          return (
            <div key={field.id} className="space-y-2">
              <Label className="break-words font-medium">{field.label}</Label>
              <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm break-words">
                {value ? (value as string) : <span className="text-gray-400">Not filled</span>}
              </div>
            </div>
          );
        case "date":
          return (
            <div key={field.id} className="space-y-2">
              <Label className="break-words font-medium">{field.label}</Label>
              <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm break-words">
                {value ? (
                  value instanceof Date
                    ? format(value, "MMM d, yyyy")
                    : format(new Date(value as string), "MMM d, yyyy")
                ) : <span className="text-gray-400">Not filled</span>}
              </div>
            </div>
          );
        case "checkbox":
          return (
            <div key={field.id} className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center bg-gray-50">
                {(value as boolean) ? (
                  <span className="text-green-600">✓</span>
                ) : null}
              </div>
              <Label className="break-words font-medium">{field.label}</Label>
            </div>
          );
        case "signature":
          return (
            <div key={field.id} className="space-y-2">
              <Label className="break-words font-medium">{field.label}</Label>
              <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed bg-gray-50">
                {value ? (
                  <div className="text-sm break-words">Signature captured</div>
                ) : (
                  <div className="text-sm text-gray-400">No signature</div>
                )}
              </div>
            </div>
          );
        default:
          return null;
      }
    }

    // Render editable view when in edit mode
    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="break-words">{field.label}</Label>
            <Input
              id={field.id}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );
      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="break-words">{field.label}</Label>
            <Input
              id={field.id}
              type="date"
              value={
                value instanceof Date
                  ? format(value, "yyyy-MM-dd")
                  : (value as string) || ""
              }
              onChange={(e) =>
                handleFieldChange(field.id, e.target.value)
              }
            />
          </div>
        );
      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={value as boolean || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="h-4 w-4 rounded border flex-shrink-0"
            />
            <Label htmlFor={field.id} className="break-words">{field.label}</Label>
          </div>
        );
      case "signature":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="break-words">{field.label}</Label>
            <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed">
              {value ? (
                <div className="text-sm break-words">Signature captured</div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleFieldChange(field.id, "signed")}
                >
                  Click to Sign
                </Button>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    if (status === "signed" || status === "locked") return "success";
    if (status === "revoked") return "destructive";
    if (status === "created") return "secondary";
    return "default";
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold break-words">
                {contract.name}
              </h1>
              <p className="mt-2 break-words">
                Blueprint: {contract.blueprintName}
              </p>
              {contract.blueprintDescription && (
                <p className="mt-1 text-sm break-words overflow-hidden">
                  {contract.blueprintDescription}
                </p>
              )}
            </div>
            <Badge variant={getStatusVariant(contract.status)} className="flex-shrink-0">
              {getStatusLabel(contract.status)}
            </Badge>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{canEdit ? "Edit Contract Fields" : "Contract Fields"}</CardTitle>
              {!canEdit && isCreated && (
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
            </div>
            {canEdit && (
              <p className="text-sm text-blue-600 break-words mt-2">
                You are in edit mode. Changes will be saved automatically.
              </p>
            )}
            {!canEdit && !isCreated && (
              <p className="text-sm text-gray-600 break-words mt-2">
                This contract is in read-only mode. Editing is only available for contracts in "Created" status.
              </p>
            )}
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
          <CardContent className="space-y-6">
            {contract.fields.map((field) => renderField(field))}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between items-center gap-4">
          <div className="text-sm break-words">
            Created: {format(new Date(contract.createdAt), "MMM d, yyyy")}
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => router.push(`/contracts/${contract.id}`)}
                className="flex-shrink-0"
              >
                Cancel Edit
              </Button>
            )}
            <Button
              onClick={() => router.push(`/contracts/${contract.id}/status`)}
              className="flex-shrink-0"
            >
              Manage Status
            </Button>
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

