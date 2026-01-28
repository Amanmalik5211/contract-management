"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capitalizeWords } from "@/lib/utils";
import type { Blueprint } from "@/types/blueprint";

interface BlueprintHeaderProps {
  blueprint: Blueprint;
  isEditMode: boolean;
}

export function BlueprintHeader({ blueprint, isEditMode }: BlueprintHeaderProps) {
  const router = useRouter();

  if (!isEditMode) {
    return (
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight break-words">
              <span className="text-primary">{capitalizeWords(blueprint.name)}</span>
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
              Created {format(new Date(blueprint.createdAt), "MMM d, yyyy")}
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/blueprints/${blueprint.id}?edit=true`)}
            className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight break-words">
            Edit <span className="text-primary">Blueprint</span>
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg leading-relaxed mt-2">
            Make your changes and click Update to save.
          </p>
        </div>
      </div>
    </section>
  );
}

