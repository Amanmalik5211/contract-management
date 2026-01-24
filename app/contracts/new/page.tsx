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

function NewContractForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { blueprints, addContract } = useStore();
  const { addToast } = useToast();
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [contractName, setContractName] = useState("");
  const initializedRef = useRef(false);

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
    router.push(`/contracts/${contract.id}?edit=true`);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Contract</h1>
          <p className="mt-2">
            Generate a new contract from a blueprint
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="blueprint">Select Blueprint</Label>
              <Select
                id="blueprint"
                value={selectedBlueprintId}
                onChange={(e) => setSelectedBlueprintId(e.target.value)}
                className="mt-1"
              >
                <option value="">Choose a blueprint...</option>
                {blueprints.map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    {bp.name} ({bp.fields.length} fields)
                  </option>
                ))}
              </Select>
              {blueprints.length === 0 && (
                <p className="mt-2 text-sm">
                  No blueprints available.{" "}
                  <Link href="/blueprints" className="text-blue-600 hover:underline">
                    Create one first
                  </Link>
                </p>
              )}
            </div>

            {selectedBlueprint && (
              <>
                <div>
                  <Label htmlFor="contractName">Contract Name</Label>
                  <Input
                    id="contractName"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="e.g., Employment Contract - John Doe"
                    className="mt-1"
                  />
                </div>

                <div className="rounded-md border p-4">
                  <h3 className="mb-2 text-sm font-medium">
                    Blueprint Preview
                  </h3>
                  <p className="text-sm">
                    <strong>Name:</strong> {selectedBlueprint.name}
                  </p>
                  {selectedBlueprint.description && (
                    <p className="mt-1 text-sm break-words whitespace-pre-wrap">
                      <strong>Description:</strong> {selectedBlueprint.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm">
                    <strong>Fields:</strong> {selectedBlueprint.fields.length}
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm">
                    {selectedBlueprint.fields.map((field) => (
                      <li key={field.id}>
                        {field.label} ({field.type})
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!selectedBlueprint || !contractName.trim()}
              >
                Create Contract
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewContractPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <NewContractForm />
    </Suspense>
  );
}

