"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/contract-utils";
import { StatusAlert } from "./status-alert";
import { StatusFlowDisplay } from "./status-flow-display";
import { StatusActions } from "./status-actions";
import type { ContractStatus } from "@/types/contract";

interface ContractStatusCardProps {
  status: ContractStatus;
  statusFlow: ContractStatus[];
  nextStatus: ContractStatus | null;
  canRevoke: boolean;
  isRevoked: boolean;
  isLocked: boolean;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  onAdvance: () => void;
  onRevoke: () => void;
}

export function ContractStatusCard({
  status,
  statusFlow,
  nextStatus,
  canRevoke,
  isRevoked,
  isLocked,
  getStatusVariant,
  onAdvance,
  onRevoke,
}: ContractStatusCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl sm:text-2xl">Current Status</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="mb-6">
          <Badge variant={getStatusVariant(status)} className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3">
            {getStatusLabel(status)}
          </Badge>
        </div>

        {isRevoked && <StatusAlert type="revoked" />}
        {isLocked && <StatusAlert type="locked" />}

        {!isRevoked && !isLocked && (
          <>
            <StatusFlowDisplay statusFlow={statusFlow} currentStatus={status} />
            <StatusActions
              nextStatus={nextStatus}
              canRevoke={canRevoke}
              onAdvance={onAdvance}
              onRevoke={onRevoke}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

