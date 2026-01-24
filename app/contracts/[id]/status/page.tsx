"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  canTransitionTo,
  getNextStatus,
  getStatusLabel,
} from "@/lib/contract-utils";
import { ArrowRight, X } from "lucide-react";
import type { ContractStatus } from "@/types/contract";
import { useToast } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const STATUS_FLOW: ContractStatus[] = [
  "created",
  "approved",
  "sent",
  "signed",
  "locked",
];

export default function ContractStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { getContract, updateContractStatus } = useStore();
  const { addToast } = useToast();
  const contract = getContract(params.id as string);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  if (!contract) {
    return <div>Contract not found</div>;
  }

  const handleStatusChange = (newStatus: ContractStatus) => {
    if (canTransitionTo(contract.status, newStatus)) {
      updateContractStatus(contract.id, newStatus);
      addToast({
        title: "Status Updated",
        description: `Contract status changed to "${getStatusLabel(newStatus)}".`,
        variant: "success",
      });
      router.push(`/contracts/${contract.id}`);
    }
  };

  const handleRevoke = () => {
    if (contract.status === "created" || contract.status === "sent") {
      setRevokeDialogOpen(true);
    }
  };

  const confirmRevoke = () => {
    if (contract.status === "created" || contract.status === "sent") {
      updateContractStatus(contract.id, "revoked");
      addToast({
        title: "Contract Revoked",
        description: "Contract has been revoked successfully.",
        variant: "warning",
      });
      setRevokeDialogOpen(false);
      router.push(`/contracts/${contract.id}`);
    }
  };

  const nextStatus = getNextStatus(contract.status);
  const canRevoke = contract.status === "created" || contract.status === "sent";
  const isRevoked = contract.status === "revoked";
  const isLocked = contract.status === "locked";

  const getStatusVariant = (status: string) => {
    if (status === "signed" || status === "locked") return "success";
    if (status === "revoked") return "destructive";
    if (status === "created") return "secondary";
    return "default";
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">
            Manage Contract Status
          </h1>
          <p className="mt-2">{contract.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Badge variant={getStatusVariant(contract.status)} className="text-lg px-4 py-2">
                {getStatusLabel(contract.status)}
              </Badge>
            </div>

            {isRevoked && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                This contract has been revoked and cannot proceed further.
              </div>
            )}

            {isLocked && (
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
                This contract is locked and cannot be modified.
              </div>
            )}

            {!isRevoked && !isLocked && (
              <>
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-medium">
                    Status Flow
                  </h3>
                  <div className="flex items-center gap-2">
                    {STATUS_FLOW.map((status, index) => {
                      const isCurrent = contract.status === status;
                      const isPast = STATUS_FLOW.indexOf(contract.status) > index;
                      const isNext = nextStatus === status;

                      return (
                        <div key={status} className="flex items-center">
                          <div
                            className={`rounded-md px-3 py-2 text-sm ${
                              isCurrent
                                ? "bg-blue-100 text-blue-800 font-medium"
                                : isPast
                                ? ""
                                : ""
                            }`}
                          >
                            {getStatusLabel(status)}
                          </div>
                          {index < STATUS_FLOW.length - 1 && (
                            <ArrowRight className="mx-2 h-4 w-4" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  {nextStatus && (
                    <Button
                      onClick={() => handleStatusChange(nextStatus)}
                      className="w-full"
                    >
                      Advance to {getStatusLabel(nextStatus)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}

                  {canRevoke && (
                    <Button
                      variant="destructive"
                      onClick={handleRevoke}
                      className="w-full"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Revoke Contract
                    </Button>
                  )}

                  {!nextStatus && !canRevoke && (
                    <p className="text-sm">
                      No further actions available for this contract.
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke &quot;{contract.name}&quot;? This action will mark the contract as revoked and it cannot proceed further. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRevoke}
            >
              Revoke Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

