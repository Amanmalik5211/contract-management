"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, PenSquare, Lock, Ban } from "lucide-react";
import { capitalizeWords } from "@/lib/utils";
import { getStatusLabel } from "@/lib/contract-utils";
import type { ContractHeaderProps } from "@/types/components";

export function ContractHeader({
  contract,
  canEdit,
  isCreated,
  isLocked,
  isRevoked,
  hasUnsavedChanges,
  getStatusVariant,
}: ContractHeaderProps) {
  const router = useRouter();

  return (
    <section className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-card overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight break-words">
                <span className="text-primary">{capitalizeWords(contract.name)}</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed break-words">
                Blueprint: {contract.blueprintName}
              </p>
            </div>
            <div className="flex flex-col min-[480px]:flex-row gap-2 sm:gap-3 w-full sm:w-auto shrink-0 sm:items-end">
              {!canEdit && isCreated && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(`/contracts/${contract.id}?edit=true`)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6"
                >
                  <Pencil className="h-4 w-4 shrink-0" />
                  Edit
                </Button>
              )}
              <Badge
                variant={getStatusVariant(contract.status)}
                className="flex items-center justify-center text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto shrink-0 self-start sm:self-auto"
              >
                {getStatusLabel(contract.status)}
              </Badge>
            </div>
          </div>

          {canEdit && (
            <div
              className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 px-3 py-2.5 sm:px-4 sm:py-3"
              aria-label="Edit mode notice"
            >
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-primary/15 dark:bg-primary/25">
                  <PenSquare className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary" aria-hidden />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">Edit mode</span>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Change fields and metadata, then click <strong>Update</strong> to save.
                  </p>
                </div>
              </div>
              {hasUnsavedChanges && (
                <span
                  className="inline-flex items-center rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ml-auto shrink-0"
                  role="status"
                >
                  Unsaved changes
                </span>
              )}
            </div>
          )}

          {!canEdit && !isCreated && (
            <div
              className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 px-3 py-2.5 sm:px-4 sm:py-3"
              aria-label="Read-only notice"
            >
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-gray-200/80 dark:bg-gray-700/80">
                  <Lock className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground" aria-hidden />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">Read-only</span>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Editing is only available for contracts in <strong>Created</strong> status.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 ml-auto shrink-0">
                {isLocked && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-200/80 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/80 dark:text-gray-300">
                    <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Locked
                  </span>
                )}
                {isRevoked && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-500/20 dark:text-red-400">
                    <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Revoked
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

