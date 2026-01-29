"use client";

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
import type { Blueprint } from "@/types/blueprint";
import type { FieldType } from "@/types/field";

const MAX_NAME_CHARS = 22;

function truncateName(name: string, maxChars: number = MAX_NAME_CHARS): string {
  if (!name || name.length <= maxChars) return name;
  return name.slice(0, maxChars).trim() + "…";
}

interface BlueprintTableRowProps {
  blueprint: Blueprint;
  fieldTypeLabels: Record<FieldType, string>;
  onView?: (id: string, e: React.MouseEvent) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, name: string, e: React.MouseEvent) => void;
}

export function BlueprintTableRow({
  blueprint,
  fieldTypeLabels,
  onView,
  onEdit,
  onDelete,
}: BlueprintTableRowProps) {
  return (
    <TableRow key={blueprint.id}>
      <TableCell className="font-medium">
        <Link
          href={`/blueprints/${blueprint.id}`}
          className="hover:underline hover:text-primary transition-colors block truncate"
          title={blueprint.name}
        >
          {truncateName(blueprint.name)}
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {blueprint.fields.length > 0 ? (
            blueprint.fields.slice(0, 3).map((field) => (
              <Badge key={field.id} variant="secondary" className="text-[10px] whitespace-nowrap">
                {fieldTypeLabels[field.type]}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground whitespace-nowrap">No fields</span>
          )}
          {blueprint.fields.length > 3 && (
             <Badge variant="secondary" className="text-[10px] whitespace-nowrap">+{blueprint.fields.length - 3}</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap">
        {format(new Date(blueprint.createdAt), "MMM d, yyyy")}
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
              <DropdownMenuItem onClick={(e) => onView(blueprint.id, e)}>
                View Details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={(e) => onEdit(blueprint.id, e)}>
              Edit Blueprint
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={(e) => onDelete(blueprint.id, blueprint.name, e)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

