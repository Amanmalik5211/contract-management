"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X } from "lucide-react";
import { InlineLoader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getNextStatus, getStatusLabel } from "@/lib/contract-utils";
import { StatusAlert } from "./status-alert";
import { StatusFlowDisplay } from "./status-flow-display";
import type { ContractStatus } from "@/types/contract";

const STATUS_FLOW: ContractStatus[] = [
  "created",
  "approved",
  "sent",
  "signed",
  "locked",
];

interface StatusManagementModalProps {
  open: boolean;
  contractName: string;
  status: ContractStatus;
  isStatusChanging: boolean;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  onOpenChange: (open: boolean) => void;
  onStatusChange: (newStatus: ContractStatus) => void;
  onRevoke: () => void;
}

export function StatusManagementModal({
  open,
  contractName,
  status,
  isStatusChanging,
  getStatusVariant,
  onOpenChange,
  onStatusChange,
  onRevoke,
}: StatusManagementModalProps) {
  const nextStatus = getNextStatus(status);
  const canRevoke = status === "created" || status === "sent";
  const isRevoked = status === "revoked";
  const isLocked = status === "locked";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">Manage Contract Status</DialogTitle>
          <DialogDescription className="text-sm sm:text-base break-words">
            {contractName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          <div>
            <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">Current Status</h3>
            <Badge variant={getStatusVariant(status)} className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
              {getStatusLabel(status)}
            </Badge>
          </div>

          {isRevoked && <StatusAlert type="revoked" />}
          {isLocked && <StatusAlert type="locked" />}

          {!isRevoked && !isLocked && (
            <>
              <StatusFlowDisplay statusFlow={STATUS_FLOW} currentStatus={status} />

              <div className="space-y-2 sm:space-y-3">
                {nextStatus && (
                  <Button
                    size="lg"
                    onClick={() => onStatusChange(nextStatus)}
                    className="w-full text-sm sm:text-base"
                    disabled={isStatusChanging}
                  >
                    {isStatusChanging ? (
                      <>
                        <InlineLoader size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Advance to {getStatusLabel(nextStatus)}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}

                {canRevoke && (
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={onRevoke}
                    className="w-full text-sm sm:text-base"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

