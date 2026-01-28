"use client";

import { useState, useEffect, useRef, startTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { generateUUID } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import { InlineLoader, PageLoader } from "@/components/ui/loader";
import { PageLayout } from "@/components/shared/page-layout";

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { blueprints, addContract } = useStore();
  const { addToast } = useToast();
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [contractName, setContractName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initializedRef = useRef(false);

  // Wait for store hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    const blueprintId = searchParams.get("blueprintId");
    if (blueprintId && blueprints.find((bp) => bp.id === blueprintId)) {
      startTransition(() => {
        setSelectedBlueprintId(blueprintId);
      });
      initializedRef.current = true;
    }
  }, [searchParams, blueprints]);

  const selectedBlueprint = blueprints.find(
    (bp) => bp.id === selectedBlueprintId
  );

  const handleCreate = async () => {
    if (!selectedBlueprint || !contractName.trim()) {
      addToast({
        title: "Validation Error",
        description: "Please select a blueprint and provide a contract name.",
        variant: "error",
      });
      return;
    }

    if (isCreating) return;

    setIsCreating(true);
    try {
      const contract = {
        id: `contract-${generateUUID()}`,
        name: contractName,
        blueprintId: selectedBlueprint.id,
        blueprintName: selectedBlueprint.name,
        status: "created" as const,
        fields: selectedBlueprint.fields.map((f, index) => ({
          ...f,
          position: index,
        })), // Copy fields with position
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
      // Navigate immediately - don't wait
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

  return (
    <PageLayout isLoading={isInitialLoad} loadingText="Loading...">
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Header - same rhythm as blueprint form */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Create <span className="text-primary">Contract</span>
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Generate a new contract from a blueprint
          </p>
        </div>

        {/* Form card - same padding/border/rounded as blueprint-form */}
        <section>
          <Card className="rounded-2xl sm:rounded-3xl border border-gray-300 dark:border-gray-700 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-primary/10 dark:via-primary/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6 md:p-8">
              <CardTitle className="text-xl sm:text-2xl">Contract Details</CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Select a blueprint and provide contract information
              </p>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8 pt-0 sm:pt-0 md:pt-0">
              {/* Select Blueprint - same dropdown styling as blueprint page */}
              <div className="space-y-2">
                <Label htmlFor="blueprint" className="text-xs sm:text-sm font-medium">
                  Select Blueprint <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="blueprint"
                  value={selectedBlueprintId}
                  onChange={(e) => setSelectedBlueprintId(e.target.value)}
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

              {selectedBlueprint && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="contractName" className="text-xs sm:text-sm font-medium">
                      Contract Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contractName"
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value)}
                      placeholder="e.g., Employment Contract - John Doe"
                      className="mt-2 h-9 sm:h-10 md:h-11 rounded-lg sm:rounded-xl border-gray-300 dark:border-gray-700 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="rounded-xl sm:rounded-2xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-800/30">
                    <h3 className="mb-2 text-base sm:text-lg font-semibold">
                      Blueprint Preview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>Name:</strong> {selectedBlueprint.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <strong>Fields:</strong> {selectedBlueprint.fields.length}
                    </p>
                    <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground space-y-0.5">
                      {selectedBlueprint.fields.map((field) => (
                        <li key={field.id}>
                          {field.label} ({field.type})
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Actions - same as blueprint form */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-300 dark:border-gray-700 pt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleCreate}
                  disabled={!selectedBlueprint || !contractName.trim() || isCreating}
                  className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8"
                >
                  {isCreating ? (
                    <>
                      <InlineLoader size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Contract"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageLayout>
  );
}

export default function NewContractPage() {
  return (
    <Suspense fallback={
      <PageLoader text="Loading contract form..." />
    }>
      <NewContractForm />
    </Suspense>
  );
}

