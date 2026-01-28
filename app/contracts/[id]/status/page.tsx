"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  canTransitionTo,
  getNextStatus,
  getStatusLabel,
} from "@/lib/contract-utils";
import type { ContractStatus } from "@/types/contract";
import { useToast } from "@/components/ui/toaster";
import { ContractStatusHeader } from "@/components/contracts/contract-status-header";
import { ContractStatusCard } from "@/components/contracts/contract-status-card";
import { RevokeConfirmationDialog } from "@/components/contracts/revoke-confirmation-dialog";
import { ContractNotFound } from "@/components/contracts/contract-not-found";

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
    return <ContractNotFound />;
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
            <ContractStatusHeader contractName={contract.name} />
          </div>

          <section className="py-6 sm:py-8">
            <ContractStatusCard
              status={contract.status}
              statusFlow={STATUS_FLOW}
              nextStatus={nextStatus}
              canRevoke={canRevoke}
              isRevoked={isRevoked}
              isLocked={isLocked}
              getStatusVariant={getStatusVariant}
              onAdvance={() => handleStatusChange(nextStatus!)}
              onRevoke={handleRevoke}
            />
          </section>
        </div>
      </div>

      <RevokeConfirmationDialog
        open={revokeDialogOpen}
        contractName={contract.name}
        onOpenChange={setRevokeDialogOpen}
        onConfirm={confirmRevoke}
      />
    </div>
  );
}

