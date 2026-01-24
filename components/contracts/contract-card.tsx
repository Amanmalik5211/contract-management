"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/contract-utils";
import type { Contract } from "@/types/contract";

interface ContractCardProps {
  contract: Contract;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (contractId: string, e: React.MouseEvent) => void;
  onDelete: (contractId: string, contractName: string, e: React.MouseEvent) => void;
}

export function ContractCard({
  contract,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ContractCardProps) {
  const filledFieldsCount = contract.fields.filter((field) => {
    const value = contract.fieldValues[field.id];
    if (value === null || value === undefined) return false;

    if (field.type === "text" || field.type === "date" || field.type === "signature") {
      return String(value).trim() !== "";
    }
    if (field.type === "checkbox") {
      return value === true;
    }
    return false;
  }).length;

  const getStatusVariant = (status: string) => {
    if (status === "signed" || status === "locked") return "success";
    if (status === "revoked") return "destructive";
    if (status === "created") return "secondary";
    return "default";
  };

  return (
    <div className="group relative p-4 border rounded-lg hover:shadow-md transition-colors overflow-hidden">
      <Link href={`/contracts/${contract.id}`} className="block">
        <div className="flex items-start justify-between gap-4 pb-12">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-lg break-words">{contract.name}</div>
            {contract.blueprintDescription && (
              <div className="text-sm mt-1 break-words whitespace-pre-wrap">
                {contract.blueprintDescription}
              </div>
            )}
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-500">
                Blueprint: {contract.blueprintName}
              </div>
              <div className="text-xs text-gray-500">
                {filledFieldsCount} of {contract.fields.length} fields filled
              </div>
              <div className="text-xs text-gray-500">
                Updated: {format(new Date(contract.updatedAt), "MMM d, yyyy")}
              </div>
            </div>
          </div>
          <Badge variant={getStatusVariant(contract.status)} className="flex-shrink-0">
            {getStatusLabel(contract.status)}
          </Badge>
        </div>
      </Link>
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => onEdit(contract.id, e)}
            title="Edit contract"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => onDelete(contract.id, contract.name, e)}
            title="Delete contract"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

