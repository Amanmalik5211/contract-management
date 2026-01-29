"use client";

import { Check, Circle } from "lucide-react";
import { getStatusLabel } from "@/lib/contract-utils";
import type { ContractStatus } from "@/types/contract";
import { cn } from "@/lib/utils";

interface StatusFlowDisplayProps {
  statusFlow: ContractStatus[];
  currentStatus: ContractStatus;
}

export function StatusFlowDisplay({ statusFlow, currentStatus }: StatusFlowDisplayProps) {
  const currentIndex = statusFlow.indexOf(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between w-full">
        {/* Connecting Line background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted z-0 rounded-full" />
        
        {/* Active Line (progress) */}
        <div 
           className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 rounded-full transition-all duration-500"
           style={{ width: `${(currentIndex / (statusFlow.length - 1)) * 100}%` }}
        />

        {statusFlow.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={status} className="relative z-10 flex flex-col items-center group">
              <div 
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all bg-background",
                  isCompleted ? "border-primary bg-primary text-primary-foreground" :
                  isCurrent ? "border-primary ring-4 ring-primary/20 scale-110" :
                  "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                   <Check className="h-4 w-4" />
                ) : isCurrent ? (
                   <div className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse" />
                ) : (
                   <div className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
                )}
              </div>
              <span 
                 className={cn(
                    "absolute top-10 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors",
                    isCurrent ? "text-primary font-bold" : 
                    isCompleted ? "text-foreground" : 
                    "text-muted-foreground"
                 )}
              >
                {getStatusLabel(status)}
              </span>
            </div>
          );
        })}
      </div>
      {/* Spacer for labels */}
      <div className="h-8" />
    </div>
  );
}
