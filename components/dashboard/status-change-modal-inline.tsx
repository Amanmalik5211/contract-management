"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { STATUS_ORDER, getNextStatus, getStatusLabel } from "@/lib/contract-utils";
import { StatusAlert } from "@/components/contracts/status-alert";
import { StatusFlowDisplay } from "@/components/contracts/status-flow-display";
import { StatusActions } from "@/components/contracts/status-actions";
import type { Contract, ContractStatus } from "@/types/contract";

interface StatusChangeModalInlineProps {
  open: boolean;
  contract: Contract;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  onOpenChange: (open: boolean) => void;
  onStatusChange: (newStatus: ContractStatus) => void;
  onRevoke: () => void;
}

export function StatusChangeModalInline({
  open,
  contract,
  getStatusVariant,
  onOpenChange,
  onStatusChange,
  onRevoke,
}: StatusChangeModalInlineProps) {
  const nextStatus = getNextStatus(contract.status);
  const canRevoke = contract.status === "created" || contract.status === "sent";
  const isRevoked = contract.status === "revoked";
  const isLocked = contract.status === "locked";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">Manage Contract Status</DialogTitle>
          <DialogDescription className="text-sm sm:text-base break-words">
            {contract.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          <div>
            <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">Current Status</h3>
            <Badge variant={getStatusVariant(contract.status)} className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
              {getStatusLabel(contract.status)}
            </Badge>
          </div>

          {isRevoked && <StatusAlert type="revoked" />}
          {isLocked && <StatusAlert type="locked" />}

          {!isRevoked && !isLocked && (
            <>
              <StatusFlowDisplay statusFlow={STATUS_ORDER} currentStatus={contract.status} />

              <StatusActions
                nextStatus={nextStatus}
                canRevoke={canRevoke}
                onAdvance={() => onStatusChange(nextStatus!)}
                onRevoke={onRevoke}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

