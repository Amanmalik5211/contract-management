"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
      <div className="relative z-0 p-4 sm:p-6 pb-12">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/contracts/${contract.id}`} className="block">
              <div className="font-semibold text-lg sm:text-xl break-words group-hover:text-primary transition-colors duration-300 mb-2">
                {contract.name}
              </div>
            </Link>
            <div className="text-sm sm:text-base text-muted-foreground mb-2">
              Blueprint: {contract.blueprintName}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Last updated: {format(new Date(contract.updatedAt), "MMM d, yyyy")}
            </div>
          </div>
          <Badge variant={getStatusVariant(contract.status)} className="flex-shrink-0 z-0">
            {getStatusLabel(contract.status)}
          </Badge>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-0">
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10"
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
    </Card>
  );
}

