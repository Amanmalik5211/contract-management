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
    return currentStatus === "created" || currentStatus === "sent";
  }
  if (targetStatus === "locked") {
    return currentStatus === "signed";
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const targetIndex = STATUS_ORDER.indexOf(targetStatus);

  if (currentIndex === -1 || targetIndex === -1) return false;

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

export function getStatusColor(status: ContractStatus): string {
  switch (status) {
    case "signed":
    case "locked": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50";
    case "revoked": return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50";
    case "created":
    case "approved":
    case "sent": return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200/50";
  }
}

export function getStatusGroup(status: ContractStatus): "active" | "pending" | "signed" {
  if (status === "signed" || status === "locked") return "signed";
  if (status === "revoked") return "pending";
  return "active";
}

