"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/ui/loader";

interface ContractFormActionsProps {
  isCreating: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
}

export function ContractFormActions({
  isCreating,
  canSubmit,
  onSubmit,
  onCancel,
  submitLabel = "Create Contract",
  cancelLabel = "Cancel",
}: ContractFormActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-300 dark:border-gray-700 pt-6">
      <Button
        variant="outline"
        size="lg"
        onClick={onCancel || (() => router.back())}
        className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6"
      >
        {cancelLabel}
      </Button>
      <Button
        size="lg"
        onClick={onSubmit}
        disabled={!canSubmit || isCreating}
        className="w-full sm:w-auto h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8"
      >
        {isCreating ? (
          <>
            <InlineLoader size="sm" className="mr-2" />
            Creating...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}

