"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface KPIChangeIndicatorProps {
  change: number | null;
}

export function KPIChangeIndicator({ change }: KPIChangeIndicatorProps) {
  if (change === null) {
    return null;
  }

  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
      isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-muted-foreground"
    }`}>
      {isPositive ? (
        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
      ) : isNegative ? (
        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
      ) : null}
      <span>
        {isPositive ? "+" : ""}
        {change}%
      </span>
    </div>
  );
}

