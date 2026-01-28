"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface RevokeConfirmationDialogProps {
  open: boolean;
  contractName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RevokeConfirmationDialog({
  open,
  contractName,
  onOpenChange,
  onConfirm,
}: RevokeConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke Contract</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke &quot;{contractName}&quot;? This action will mark the contract as revoked and it cannot proceed further. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Revoke Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

