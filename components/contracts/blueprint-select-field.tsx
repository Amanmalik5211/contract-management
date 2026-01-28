"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Blueprint } from "@/types/blueprint";

interface BlueprintSelectFieldProps {
  blueprints: Blueprint[];
  selectedBlueprintId: string;
  onBlueprintChange: (blueprintId: string) => void;
}

export function BlueprintSelectField({
  blueprints,
  selectedBlueprintId,
  onBlueprintChange,
}: BlueprintSelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="blueprint" className="text-xs sm:text-sm font-medium">
        Select Blueprint <span className="text-red-500">*</span>
      </Label>
      <Select
        id="blueprint"
        value={selectedBlueprintId}
        onChange={(e) => onBlueprintChange(e.target.value)}
        className="mt-2 h-9 sm:h-10 md:h-11 w-full rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors focus:border-gray-400 dark:focus:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label="Choose a blueprint"
      >
        <option value="">Choose a blueprint...</option>
        {blueprints.map((bp) => (
          <option key={bp.id} value={bp.id}>
            {bp.name} ({bp.fields.length} fields)
          </option>
        ))}
      </Select>
      {blueprints.length === 0 && (
        <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
          No blueprints available.{" "}
          <Link href="/blueprints" className="text-primary hover:underline">
            Create one first
          </Link>
        </p>
      )}
    </div>
  );
}

