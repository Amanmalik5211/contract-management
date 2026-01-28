"use client";

import type { Blueprint } from "@/types/blueprint";

interface BlueprintPreviewProps {
  blueprint: Blueprint;
}

export function BlueprintPreview({ blueprint }: BlueprintPreviewProps) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-800/30">
      <h3 className="mb-2 text-base sm:text-lg font-semibold">
        Blueprint Preview
      </h3>
      <p className="text-sm text-muted-foreground">
        <strong>Name:</strong> {blueprint.name}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        <strong>Fields:</strong> {blueprint.fields.length}
      </p>
      <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground space-y-0.5">
        {blueprint.fields.map((field) => (
          <li key={field.id}>
            {field.label} ({field.type})
          </li>
        ))}
      </ul>
    </div>
  );
}

