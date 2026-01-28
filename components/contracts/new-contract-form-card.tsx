"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlueprintSelectField } from "./blueprint-select-field";
import { BlueprintPreview } from "./blueprint-preview";
import { ContractFormActions } from "./contract-form-actions";
import type { Blueprint } from "@/types/blueprint";

interface NewContractFormCardProps {
  blueprints: Blueprint[];
  selectedBlueprintId: string;
  contractName: string;
  isCreating: boolean;
  onBlueprintChange: (blueprintId: string) => void;
  onContractNameChange: (name: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function NewContractFormCard({
  blueprints,
  selectedBlueprintId,
  contractName,
  isCreating,
  onBlueprintChange,
  onContractNameChange,
  onSubmit,
  onCancel,
}: NewContractFormCardProps) {
  const selectedBlueprint = blueprints.find(
    (bp) => bp.id === selectedBlueprintId
  );

  const canSubmit = !!selectedBlueprint && contractName.trim().length > 0;

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-gray-300 dark:border-gray-700 shadow-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-primary/10 dark:via-primary/5" />
      <CardHeader className="relative z-10 p-4 sm:p-6 md:p-8">
        <CardTitle className="text-xl sm:text-2xl">Contract Details</CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Select a blueprint and provide contract information
        </p>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8 pt-0 sm:pt-0 md:pt-0">
        <BlueprintSelectField
          blueprints={blueprints}
          selectedBlueprintId={selectedBlueprintId}
          onBlueprintChange={onBlueprintChange}
        />

        {selectedBlueprint && (
          <>
            <div className="space-y-2">
              <Label htmlFor="contractName" className="text-xs sm:text-sm font-medium">
                Contract Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contractName"
                value={contractName}
                onChange={(e) => onContractNameChange(e.target.value)}
                placeholder="e.g., Employment Contract - John Doe"
                className="mt-2 h-9 sm:h-10 md:h-11 rounded-lg sm:rounded-xl border-gray-300 dark:border-gray-700 text-xs sm:text-sm"
              />
            </div>

            <BlueprintPreview blueprint={selectedBlueprint} />
          </>
        )}

        <ContractFormActions
          isCreating={isCreating}
          canSubmit={canSubmit}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
}

