"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Plus } from "lucide-react";

export default function ContractsPage() {
  const { blueprints, addContract, deleteContract } = useStore();
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [contractName, setContractName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<{ id: string; name: string } | null>(null);

  const selectedBlueprint = blueprints.find(
    (bp) => bp.id === selectedBlueprintId
  );

  const handleCreate = () => {
    if (!selectedBlueprint || !contractName.trim()) {
      addToast({
        title: "Validation Error",
        description: "Please select a blueprint and provide a contract name.",
        variant: "error",
      });
      return;
    }

    const contract = {
      id: `contract-${generateUUID()}`,
      name: contractName,
      blueprintId: selectedBlueprint.id,
      blueprintName: selectedBlueprint.name,
      blueprintDescription: selectedBlueprint.description,
      status: "created" as const,
      fields: selectedBlueprint.fields,
      fieldValues: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addContract(contract);
    addToast({
      title: "Contract Created",
      description: `"${contractName}" has been created successfully.`,
      variant: "success",
    });
    // Reset form
    setContractName("");
    setSelectedBlueprintId("");
    router.push(`/contracts/${contract.id}?edit=true`);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContract(contractToDelete.id);
      addToast({
        title: "Contract Deleted",
        description: `"${contractToDelete.name}" has been deleted successfully.`,
        variant: "success",
      });
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden from-primary/5 via-background to-secondary/30">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <section className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight">
                    <span className="text-primary">Contracts</span>
                  </h1>
                  <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">
                    Manage and track all your contracts
                  </p>
                </div>
              </div>
            </section>

            <section className="py-6 sm:py-8">
              <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-300 dark:border-gray-700 shadow-xl">
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl sm:text-2xl">Create New Contract</CardTitle>
                  <p className="text-sm sm:text-base mt-2">
                    Select a blueprint and provide contract information
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div>
                    <Label htmlFor="blueprint" className="text-sm font-medium">Select Blueprint</Label>
                    <Select
                      id="blueprint"
                      value={selectedBlueprintId}
                      onChange={(e) => setSelectedBlueprintId(e.target.value)}
                      className="mt-2 h-11 sm:h-12 rounded-xl sm:rounded-2xl border-gray-300 dark:border-gray-700 transition-colors focus:border-gray-400 dark:focus:border-gray-600 shadow-sm"
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
                          onChange={(e) => setContractName(e.target.value)}
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
                          {selectedBlueprint.description && (
                            <p className="break-words whitespace-pre-wrap">
                              <strong>Description:</strong> <span>{selectedBlueprint.description}</span>
                            </p>
                          )}
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

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => {
                        setContractName("");
                        setSelectedBlueprintId("");
                      }}
                      className="h-11 sm:h-12 px-6 shadow-md"
                    >
                      Clear
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleCreate}
                      disabled={!selectedBlueprint || !contractName.trim()}
                      className="h-11 sm:h-12 px-8 shadow-md"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Contract
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setContractToDelete(null);
        }}
        itemName={contractToDelete?.name || ""}
        itemType="contract"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

