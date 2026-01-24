import type { ContractStatus } from "@/types/contract";

export const STATUS_ORDER: ContractStatus[] = [
  "created",
  "approved",
  "sent",
  "signed",
  "locked",
];

export function canTransitionTo(
  currentStatus: ContractStatus,
  targetStatus: ContractStatus
): boolean {
  if (currentStatus === "revoked") return false;
  if (targetStatus === "revoked") {
    // Can revoke from created or sent
    return currentStatus === "created" || currentStatus === "sent";
  }
  if (targetStatus === "locked") {
    return currentStatus === "signed";
  }
  
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const targetIndex = STATUS_ORDER.indexOf(targetStatus);
  
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  // Can only move forward one step at a time
  return targetIndex === currentIndex + 1;
}

export function getNextStatus(currentStatus: ContractStatus): ContractStatus | null {
  if (currentStatus === "revoked" || currentStatus === "locked") return null;
  
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) return null;
  
  return STATUS_ORDER[currentIndex + 1];
}

export function getStatusLabel(status: ContractStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getStatusGroup(status: ContractStatus): "active" | "pending" | "signed" {
  if (status === "signed" || status === "locked") return "signed";
  if (status === "revoked") return "pending";
  return "active";
}

