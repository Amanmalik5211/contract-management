"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X, CheckCircle2, Ban } from "lucide-react";
import { InlineLoader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
      <DialogContent className="max-w-md md:max-w-xl p-6 gap-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-primary/10 rounded-full text-primary">
                <CheckCircle2 className="w-6 h-6" />
             </div>
             <div>
                <DialogTitle className="text-xl">Update Status</DialogTitle>
                <DialogDescription className="text-sm mt-1 line-clamp-1">
                   {contractName}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
             {isRevoked ? (
                <StatusAlert type="revoked" />
             ) : isLocked ? (
                <div className="space-y-4">
                   <StatusAlert type="locked" />
                   <StatusFlowDisplay statusFlow={STATUS_FLOW} currentStatus={status} />
                </div>
             ) : (
                <StatusFlowDisplay statusFlow={STATUS_FLOW} currentStatus={status} />
             )}
          </div>

          {!isRevoked && !isLocked && (
            <div className="grid gap-3">
              {nextStatus ? (
                <Button
                  size="lg"
                  onClick={() => onStatusChange(nextStatus)}
                  disabled={isStatusChanging}
                  className="w-full text-base font-semibold shadow-lg hover:shadow-primary/20 transition-all h-12"
                >
                  {isStatusChanging ? (
                    <>
                      <InlineLoader size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Mark as {getStatusLabel(nextStatus)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                 <p className="text-center text-sm text-muted-foreground">
                    Contract has reached final stage.
                 </p>
              )}

              {canRevoke && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRevoke}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Revoke Contract
                </Button>
              )}
            </div>
          )}
          
          {(isRevoked || isLocked || (!nextStatus && !canRevoke)) && (
             <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                Close
             </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
