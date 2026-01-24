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
      <div className="relative overflow-hidden from-primary/5 via-background to-secondary/30">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8">
          <div className="mb-8 sm:mb-12">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 sm:mb-6">
              ← Back
            </Button>
            <section className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-bold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl leading-tight">
                Manage Contract <span className="text-primary">Status</span>
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg lg:text-xl leading-relaxed">{contract.name}</p>
            </section>
          </div>

          <section className="py-6 sm:py-8">
            <Card className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl sm:text-2xl">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="mb-6">
                  <Badge variant={getStatusVariant(contract.status)} className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3">
                    {getStatusLabel(contract.status)}
                  </Badge>
                </div>

                {isRevoked && (
                  <div className="rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 p-4 sm:p-6 text-sm sm:text-base text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 mb-6">
                    This contract has been revoked and cannot proceed further.
                  </div>
                )}

                {isLocked && (
                  <div className="rounded-xl sm:rounded-2xl bg-green-50 border border-green-200 p-4 sm:p-6 text-sm sm:text-base text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 mb-6">
                    This contract is locked and cannot be modified.
                  </div>
                )}

                {!isRevoked && !isLocked && (
                  <>
                    <div className="mb-6 sm:mb-8">
                      <h3 className="mb-4 text-base sm:text-lg font-semibold">
                        Status Flow
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {STATUS_FLOW.map((status, index) => {
                          const isCurrent = contract.status === status;
                          const isPast = STATUS_FLOW.indexOf(contract.status) > index;
                          const isNext = nextStatus === status;

                          return (
                            <div key={status} className="flex items-center">
                              <div
                                className={`rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium transition-all ${
                                  isCurrent
                                    ? "bg-primary/20 text-primary border border-primary/30 shadow-md"
                                    : isPast
                                    ? "bg-muted/50 text-muted-foreground border border-border/50"
                                    : "bg-background text-muted-foreground border border-border/50"
                                }`}
                              >
                                {getStatusLabel(status)}
                              </div>
                              {index < STATUS_FLOW.length - 1 && (
                                <ArrowRight className="mx-2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-4">
                      {nextStatus && (
                        <Button
                          size="lg"
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
                          size="lg"
                          onClick={handleRevoke}
                          className="w-full"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Revoke Contract
                        </Button>
                      )}

                      {!nextStatus && !canRevoke && (
                        <p className="text-sm sm:text-base text-muted-foreground">
                          No further actions available for this contract.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
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

