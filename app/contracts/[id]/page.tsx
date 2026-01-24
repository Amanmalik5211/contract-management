"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/contract-utils";
import { format } from "date-fns";
import type { Field } from "@/types/field";

export default function ContractViewPage() {
  const params = useParams();
  const router = useRouter();
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

  const isLocked = contract.status === "locked";
  const isRevoked = contract.status === "revoked";
  const canEdit = !isLocked && !isRevoked;

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

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="break-words">{field.label}</Label>
            <Input
              id={field.id}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={!canEdit}
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
              disabled={!canEdit}
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
              disabled={!canEdit}
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
                  disabled={!canEdit}
                >
                  {canEdit ? "Click to Sign" : "Signature Required"}
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
            <CardTitle>Contract Fields</CardTitle>
            {isLocked && (
              <p className="text-sm break-words">
                This contract is locked and cannot be edited.
              </p>
            )}
            {isRevoked && (
              <p className="text-sm text-red-600 break-words">
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
          <Button
            onClick={() => router.push(`/contracts/${contract.id}/status`)}
            className="flex-shrink-0"
          >
            Manage Status
          </Button>
        </div>
      </div>
    </div>
  );
}

