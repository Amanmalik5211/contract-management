import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <TableCell className="font-medium">
        <Link
          href={`/contracts/${contract.id}`}
          className="hover:underline hover:text-primary transition-colors block truncate"
          title={contract.name}
        >
          {truncateName(contract.name)}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground" title={contract.blueprintName}>
        {truncateName(contract.blueprintName)}
      </TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(contract.status)} className="whitespace-nowrap">
          {getStatusLabel(contract.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap">
        {format(new Date(contract.createdAt), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={(e) => onView(contract.id, e)}>
                View Details
              </DropdownMenuItem>
            )}
            {canEdit && (
              <DropdownMenuItem onClick={(e) => onEdit(contract.id, e)}>
                Edit Contract
              </DropdownMenuItem>
            )}
            {onStatusChange && (
              <DropdownMenuItem onClick={(e) => onStatusChange(contract, e)}>
                Change Status
              </DropdownMenuItem>
            )}
            {(canEdit || canDelete) && <DropdownMenuSeparator />}
            {canDelete && (
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={(e) => onDelete(contract.id, contract.name, e)}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

