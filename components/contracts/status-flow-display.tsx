"use client";

import { ArrowRight } from "lucide-react";
import { getStatusLabel } from "@/lib/contract-utils";
import type { ContractStatus } from "@/types/contract";

interface StatusFlowDisplayProps {
  statusFlow: ContractStatus[];
  currentStatus: ContractStatus;
}

export function StatusFlowDisplay({ statusFlow, currentStatus }: StatusFlowDisplayProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="mb-4 text-base sm:text-lg font-semibold">Status Flow</h3>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {statusFlow.map((status, index) => {
          const isCurrent = currentStatus === status;
          const isPast = statusFlow.indexOf(currentStatus) > index;

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
              {index < statusFlow.length - 1 && (
                <ArrowRight className="mx-2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

