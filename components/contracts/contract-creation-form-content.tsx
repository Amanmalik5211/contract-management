"use client";

import Link from "next/link";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InlineLoader } from "@/components/ui/loader";
import type { Blueprint } from "@/types/blueprint";

interface ContractCreationFormContentProps {
  blueprints: Blueprint[];
  selectedBlueprintId: string;
  contractName: string;
  isCreating: boolean;
  onBlueprintChange: (blueprintId: string) => void;
  onContractNameChange: (name: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function ContractCreationFormContent({
  blueprints,
  selectedBlueprintId,
  contractName,
  isCreating,
  onBlueprintChange,
  onContractNameChange,
  onClear,
  onSubmit,
}: ContractCreationFormContentProps) {
  const selectedBlueprint = blueprints.find(
    (bp) => bp.id === selectedBlueprintId
  );

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <CardHeader className="px-0 pt-0 pb-0">
        <CardTitle className="text-2xl font-semibold tracking-tight">Contract Details</CardTitle>
        <p className="text-muted-foreground">
          Review the blueprint and name your contract.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 px-0">
        <div className="space-y-2">
          <Label className="text-base font-medium">Selected Blueprint</Label>
          <div className="relative">
             <Input
               value={selectedBlueprint?.name || "No blueprint selected"}
               readOnly
               disabled
               className="bg-muted/50 text-foreground opacity-100 font-medium border-input"
             />
          </div>
          {selectedBlueprint && (
             <p className="text-sm text-muted-foreground">
                Contains {selectedBlueprint.fields.length} fields: {selectedBlueprint.fields.map(f => f.label).join(", ")}
             </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractName" className="text-base font-medium">Contract Name</Label>
          <Input
            id="contractName"
            value={contractName}
            onChange={(e) => onContractNameChange(e.target.value)}
            placeholder="e.g. Sales Agreement - Acme Corp"
            className="bg-background"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={onClear}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedBlueprint || !contractName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <InlineLoader size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Contract
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
