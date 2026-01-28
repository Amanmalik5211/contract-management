"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { getStatusLabel } from "@/lib/contract-utils";
import type { Contract } from "@/types/contract";

const MAX_NAME_CHARS = 22;

function truncateName(name: string, maxChars: number = MAX_NAME_CHARS): string {
  if (!name || name.length <= maxChars) return name;
  return name.slice(0, maxChars).trim() + "…";
}

interface ContractTableRowProps {
  contract: Contract;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  onView?: (id: string, e: React.MouseEvent) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, name: string, e: React.MouseEvent) => void;
  onStatusChange?: (contract: Contract, e: React.MouseEvent) => void;
}

export function ContractTableRow({
  contract,
  getStatusVariant,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: ContractTableRowProps) {
  const canEdit = contract.status === "created";
  const canDelete = contract.status === "created" || contract.status === "revoked";

  return (
    <TableRow key={contract.id}>
      <TableCell className="font-medium text-center text-xs sm:text-sm max-w-0 px-2 sm:px-4" title={contract.name}>
        <Link
          href={`/contracts/${contract.id}`}
          className="hover:text-primary transition-colors block truncate"
        >
          {truncateName(contract.name)}
        </Link>
      </TableCell>
      <TableCell className="text-center text-xs sm:text-sm max-w-0 px-2 sm:px-4 truncate" title={contract.blueprintName}>
        {truncateName(contract.blueprintName)}
      </TableCell>
      <TableCell className="text-center text-xs sm:text-sm px-2 sm:px-4">
        <Badge variant={getStatusVariant(contract.status)} className="text-xs whitespace-nowrap">
          {getStatusLabel(contract.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
        {format(new Date(contract.createdAt), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="text-center text-xs sm:text-sm px-2 sm:px-4">
        {onStatusChange && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => onStatusChange(contract, e)}
            className="text-xs px-2 sm:px-3"
          >
            <span className="hidden sm:inline">Change Status</span>
            <span className="sm:hidden">Status</span>
          </Button>
        )}
      </TableCell>
      <TableCell className="text-center text-xs sm:text-sm px-2 sm:px-4">
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onView(contract.id, e);
              }}
              title="View contract"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(contract.id, e);
              }}
              title="Edit contract"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(contract.id, contract.name, e);
              }}
              title="Delete contract"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

