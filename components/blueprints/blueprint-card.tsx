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
      <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/20 h-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
        <Link
          href={`/blueprints/${blueprint.id}`}
          className="flex-1 flex flex-col relative z-10"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl break-words group-hover:text-primary transition-colors duration-300">{blueprint.name}</CardTitle>
                {blueprint.description && (
                  <CardDescription className="mt-1 text-sm sm:text-base text-muted-foreground line-clamp-2 break-words whitespace-pre-wrap leading-relaxed">
                    {blueprint.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-12">
            <div className="text-sm sm:text-base">
              <p className="font-medium">{blueprint.fields.length} field{blueprint.fields.length !== 1 ? "s" : ""}</p>
              <ul className="mt-2 space-y-1">
                {blueprint.fields.map((field) => (
                  <li key={field.id} className="text-xs sm:text-sm break-words text-muted-foreground">
                    • {field.label} ({fieldTypeLabels[field.type]})
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Link>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/10"
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

