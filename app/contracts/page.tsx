"use client";

import { useState, useEffect } from "react";
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
import { Plus, FileText, FileCheck, Sparkles } from "lucide-react";
import { InlineLoader } from "@/components/ui/loader";
import { PageLayout } from "@/components/shared/page-layout";

export default function ContractsPage() {
  const { blueprints, addContract, deleteContract } = useStore();
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [contractName, setContractName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Wait for store hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const selectedBlueprint = blueprints.find(
    (bp) => bp.id === selectedBlueprintId
  );

  const handleCreate = async () => {
    if (!selectedBlueprint || !contractName.trim() || isCreating) {
      if (!selectedBlueprint || !contractName.trim()) {
        addToast({
          title: "Validation Error",
          description: "Please select a blueprint and provide a contract name.",
          variant: "error",
        });
      }
      return;
    }

    setIsCreating(true);
    try {
      const contract = {
        id: `contract-${generateUUID()}`,
        name: contractName,
        blueprintId: selectedBlueprint.id,
        blueprintName: selectedBlueprint.name,
        status: "created" as const,
        fields: selectedBlueprint.fields.map((f) => ({ ...f })), // Copy fields
        fieldValues: {},
        pdfUrl: selectedBlueprint.pdfUrl, // Copy PDF URL
        pageCount: selectedBlueprint.pageCount, // Copy page count
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addContract(contract);
      addToast({
        title: "Contract Created",
        description: `"${contractName}" has been created successfully.`,
        variant: "success",
      });
      // Navigate immediately
      router.push(`/contracts/${contract.id}?edit=true`);
    } catch {
      setIsCreating(false);
      addToast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (contractToDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        deleteContract(contractToDelete.id);
        addToast({
          title: "Contract Deleted",
          description: `"${contractToDelete.name}" has been deleted successfully.`,
          variant: "success",
        });
        setDeleteDialogOpen(false);
        setContractToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <PageLayout isLoading={isInitialLoad} loadingText="Loading contracts...">
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
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 dark:from-primary/10 dark:via-primary/5" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                  {/* Left Side - Visual Design */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
                    <div className="relative w-full max-w-[200px] mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-primary/30 to-primary/20 rounded-2xl p-8 shadow-lg">
                        <FileText className="h-16 w-16 text-primary mx-auto" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="space-y-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold text-primary">Quick Creation</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold text-primary">Template-Based</span>
                      </div>
                    </div>
                    <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
                  </div>

                  {/* Right Side - Form Content */}
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
                      onChange={(e) => setSelectedBlueprintId(e.target.value)}
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
                      onClick={() => {
                        setContractName("");
                        setSelectedBlueprintId("");
                      }}
                      className="w-full sm:w-auto h-11 sm:h-12 px-6 shadow-md"
                    >
                      Clear
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleCreate}
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
                </div>
              </Card>
        </section>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setDeleteDialogOpen(open);
            if (!open) setContractToDelete(null);
          }
        }}
        itemName={contractToDelete?.name || ""}
        itemType="contract"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </PageLayout>
  );
}

