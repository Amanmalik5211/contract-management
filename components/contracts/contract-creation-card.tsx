"use client";

import { Card } from "@/components/ui/card";
import { ContractCreationFormContent } from "./contract-creation-form-content";
import type { Blueprint } from "@/types/blueprint";

interface ContractCreationCardProps {
  blueprints: Blueprint[];
  selectedBlueprintId: string;
  contractName: string;
  isCreating: boolean;
  onBlueprintChange: (blueprintId: string) => void;
  onContractNameChange: (name: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function ContractCreationCard({
  blueprints,
  selectedBlueprintId,
  contractName,
  isCreating,
  onBlueprintChange,
  onContractNameChange,
  onClear,
  onSubmit,
}: ContractCreationCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-300 dark:border-gray-700 shadow-xl max-w-4xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 dark:from-primary/10 dark:via-primary/5" />
      <div className="relative z-10 w-full">
        <ContractCreationFormContent
          blueprints={blueprints}
          selectedBlueprintId={selectedBlueprintId}
          contractName={contractName}
          isCreating={isCreating}
          onBlueprintChange={onBlueprintChange}
          onContractNameChange={onContractNameChange}
          onClear={onClear}
          onSubmit={onSubmit}
        />
      </div>
    </Card>
  );
}

