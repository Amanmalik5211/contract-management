"use client";

import { AlertTriangle } from "lucide-react";

interface OverflowWarningBannerProps {
  count: number;
}

export function OverflowWarningBanner({ count }: OverflowWarningBannerProps) {
  if (count === 0) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-red-800 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-mediu">
            {count} field{count !== 1 ? "s" : ""} {count !== 1 ? "exceed" : "exceeds"}{" "}
            the available space
          </p>
          <p className="text-x mt-1">
            Text exceeds the available space for this field. Please reduce the text
            to fit within the field boundaries.
          </p>
        </div>
      </div>
    </div>
  );
}
