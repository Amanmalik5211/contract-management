"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { InlineLoader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DownloadWarningsDialogProps {
  open: boolean;
  warnings: {
    overlappingFieldLabels: string[];
    unfilledFieldLabels: string[];
    fieldsOverlappingPdfTextLabels: string[];
  };
  isDownloading: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}

export function DownloadWarningsDialog({
  open,
  warnings,
  isDownloading,
  onOpenChange,
  onDownload,
}: DownloadWarningsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Download PDF — Warnings</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            The following issues may affect the downloaded PDF. You can still download, but overlapping or unfilled fields may not display as expected.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {warnings.fieldsOverlappingPdfTextLabels && warnings.fieldsOverlappingPdfTextLabels.length > 0 && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3">
              <p className="text-sm font-semibold mb-2">
                Fields overlapping PDF text (may obscure existing text on the downloaded PDF):
              </p>
              <ul className="text-sm list-disc list-inside space-y-1">
                {warnings.fieldsOverlappingPdfTextLabels.map((label, index) => (
                  <li key={`${label}-${index}`}>{label}</li>
                ))}
              </ul>
            </div>
          )}
          {warnings.overlappingFieldLabels.length > 0 && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3">
              <p className="text-sm font-semibold mb-2">
                Overlapping fields (will not display correctly on the downloaded PDF):
              </p>
              <ul className="text-sm list-disc list-inside space-y-1">
                {warnings.overlappingFieldLabels.map((label, index) => (
                  <li key={`${label}-${index}`}>{label}</li>
                ))}
              </ul>
            </div>
          )}
          {warnings.unfilledFieldLabels.length > 0 && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 p-3">
              <p className="text-sm font-semibold mb-2">
                Unfilled fields (will not show on the downloaded PDF):
              </p>
              <ul className="text-sm list-disc list-inside space-y-1">
                {warnings.unfilledFieldLabels.map((label, index) => (
                  <li key={`${label}-${index}`}>{label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto"
          >
            {isDownloading ? (
              <>
                <InlineLoader size="sm" className="mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 shrink-0 mr-2" />
                Download anyway
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

