"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
      <TableCell className="font-medium text-center text-xs sm:text-sm max-w-0 px-2 sm:px-4" title={blueprint.name}>
        <Link
          href={`/blueprints/${blueprint.id}`}
          className="hover:text-primary transition-colors block truncate"
        >
          {truncateName(blueprint.name)}
        </Link>
      </TableCell>
      <TableCell className="text-center text-xs sm:text-sm px-2 sm:px-4 min-w-0">
        <div className="flex flex-wrap gap-1 justify-center">
          {blueprint.fields.length > 0 ? (
            blueprint.fields.map((field) => (
              <Badge key={field.id} variant="secondary" className="text-[10px] sm:text-xs whitespace-nowrap">
                {fieldTypeLabels[field.type]}
              </Badge>
            ))
          ) : (
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">No fields</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
        {format(new Date(blueprint.createdAt), "MMM d, yyyy")}
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
                onView(blueprint.id, e);
              }}
              title="View blueprint"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(blueprint.id, e);
            }}
            title="Edit blueprint"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(blueprint.id, blueprint.name, e);
            }}
            title="Delete blueprint"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

