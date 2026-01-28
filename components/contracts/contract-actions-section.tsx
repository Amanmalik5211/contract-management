"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { InlineLoader } from "@/components/ui/loader";
import type { Contract } from "@/types/contract";

interface ContractActionsSectionProps {
  contract: Contract;
  canEdit: boolean;
  isSaving: boolean;
  isDownloading: boolean;
  isStatusChanging: boolean;
  hasUnsavedChanges: boolean;
  onCancel: () => void;
  onSave: () => void;
  onDownload: () => void;
  onManageStatus: () => void;
}

export function ContractActionsSection({
  contract,
  canEdit,
  isSaving,
  isDownloading,
  isStatusChanging,
  hasUnsavedChanges,
  onCancel,
  onSave,
  onDownload,
  onManageStatus,
}: ContractActionsSectionProps) {
  const router = useRouter();

  return (
    <section className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-card p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs sm:text-sm md:text-base text-muted-foreground break-words order-2 sm:order-1">
          Created: {format(new Date(contract.createdAt), "MMM d, yyyy")}
        </div>
        <div className="flex flex-col min-[480px]:flex-row gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2 flex-wrap">
          {contract.pdfUrl && (
            <Button
              size="lg"
              onClick={onDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <InlineLoader size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 shrink-0" />
                  Download Contract
                </>
              )}
            </Button>
          )}
          {canEdit ? (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={onCancel}
                className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={onSave}
                className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8"
                disabled={!hasUnsavedChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <InlineLoader size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={onManageStatus}
              className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8"
              disabled={isStatusChanging}
            >
              {isStatusChanging ? (
                <>
                  <InlineLoader size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Manage Status"
              )}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

