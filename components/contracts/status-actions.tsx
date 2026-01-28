"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { getStatusLabel } from "@/lib/contract-utils";
import type { ContractStatus } from "@/types/contract";

interface StatusActionsProps {
  nextStatus: ContractStatus | null;
  canRevoke: boolean;
  onAdvance: () => void;
  onRevoke: () => void;
}

export function StatusActions({ nextStatus, canRevoke, onAdvance, onRevoke }: StatusActionsProps) {
  return (
    <div className="space-y-3 sm:space-4">
      {nextStatus && (
        <Button
          size="lg"
          onClick={onAdvance}
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
          onClick={onRevoke}
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
  );
}

