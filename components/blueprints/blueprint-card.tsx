"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Blueprint } from "@/types/blueprint";
import type { FieldType } from "@/types/field";

interface BlueprintCardProps {
  blueprint: Blueprint;
  fieldTypeLabels: Record<FieldType, string>;
  onEdit: (blueprintId: string, e: React.MouseEvent) => void;
  onDelete: (blueprintId: string, blueprintName: string, e: React.MouseEvent) => void;
}

export function BlueprintCard({
  blueprint,
  fieldTypeLabels,
  onEdit,
  onDelete,
}: BlueprintCardProps) {
  return (
    <div className="group relative">
      <Card className="hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        <Link
          href={`/blueprints/${blueprint.id}`}
          className="flex-1 flex flex-col"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg break-words">{blueprint.name}</CardTitle>
                {blueprint.description && (
                  <CardDescription className="mt-1 text-sm text-gray-600 line-clamp-2 break-words whitespace-pre-wrap">
                    {blueprint.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-12">
            <div className="text-sm">
              <p className="font-medium">{blueprint.fields.length} fields</p>
              <ul className="mt-2 space-y-1">
                {blueprint.fields.map((field) => (
                  <li key={field.id} className="text-xs break-words">
                    • {field.label} ({fieldTypeLabels[field.type]})
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Link>
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
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
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </Card>
    </div>
  );
}

