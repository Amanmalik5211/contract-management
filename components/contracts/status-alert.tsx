"use client";

interface StatusAlertProps {
  type: "revoked" | "locked";
}

export function StatusAlert({ type }: StatusAlertProps) {
  if (type === "revoked") {
    return (
      <div className="rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 p-4 sm:p-6 text-sm sm:text-base text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 mb-6">
        This contract has been revoked and cannot proceed further.
      </div>
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl bg-green-50 border border-green-200 p-4 sm:p-6 text-sm sm:text-base text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 mb-6">
      This contract is locked and cannot be modified.
    </div>
  );
}

