"use client";

import Link from "next/link";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
    <div className="lg:col-span-8 p-5">
      <CardHeader className="relative z-10 px-0 pt-0">
        <CardTitle className="text-xl sm:text-2xl">Create New Contract</CardTitle>
        <p className="text-sm sm:text-base mt-2">
          Select a blueprint and provide contract information
        </p>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10 px-0">
        <div>
          <Label htmlFor="blueprint" className="text-sm font-medium">Select Blueprint</Label>
          <Select
            id="blueprint"
            value={selectedBlueprintId}
            onChange={(e) => onBlueprintChange(e.target.value)}
            className="mt-2 h-11 bg-[#DBEAFE]  sm:h-12 rounded-xl sm:rounded-2xl border-gray-300 dark:border-gray-700 transition-colors focus:border-gray-400 dark:focus:border-gray-600 shadow-2xl text-black border border-2px"
          >
            <option value="">Choose a blueprint...</option>
            {blueprints.map((bp) => (
              <option key={bp.id} value={bp.id}>
                {bp.name} ({bp.fields.length} fields)
              </option>
            ))}
          </Select>
          {blueprints.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              No blueprints available.{" "}
              <Link href="/blueprints" className="text-primary hover:underline font-medium">
                Create one first
              </Link>
            </p>
          )}
        </div>

        {selectedBlueprint && (
          <>
            <div>
              <Label htmlFor="contractName" className="text-sm font-medium">Contract Name</Label>
              <Input
                id="contractName"
                value={contractName}
                onChange={(e) => onContractNameChange(e.target.value)}
                placeholder="e.g., Employment Contract - John Doe"
                className="mt-2 h-11 sm:h-12 rounded-xl sm:rounded-2xl border-gray-300 dark:border-gray-700 transition-colors focus:border-gray-400 dark:focus:border-gray-600 shadow-sm"
              />
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6 shadow-md">
              <h3 className="mb-3 text-base sm:text-lg font-semibold">
                Blueprint Preview
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> <span>{selectedBlueprint.name}</span>
                </p>
                <p>
                  <strong>Fields:</strong> <span>{selectedBlueprint.fields.length}</span>
                </p>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  {selectedBlueprint.fields.map((field) => (
                    <li key={field.id}>
                      {field.label} <span>({field.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-300 dark:border-gray-700">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onClear}
            className="w-full sm:w-auto h-11 sm:h-12 px-6 shadow-md"
          >
            Clear
          </Button>
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={!selectedBlueprint || !contractName.trim() || isCreating}
            className="w-full sm:w-auto h-11 sm:h-12 px-8 shadow-md"
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

