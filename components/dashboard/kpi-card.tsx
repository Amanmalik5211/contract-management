"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { KPIIconContainer } from "./kpi-icon-container";
import { KPIChangeIndicator } from "./kpi-change-indicator";

interface KPICardProps {
  title: string;
  value: number;
  change: number | null;
  icon: LucideIcon;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  isCritical: boolean;
}

export function KPICard({
  title,
  value,
  change,
  icon,
  bgGradient,
  iconBg,
  iconColor,
  valueColor,
  isCritical,
}: KPICardProps) {
  return (
    <Card
      className={`group relative overflow-hidden ${
        isCritical ? "ring-2 ring-red-500/50" : ""
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-100 group-hover:opacity-100 transition-opacity duration-500`} />
      <CardContent className="p-4 sm:p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <KPIIconContainer icon={icon} iconBg={iconBg} iconColor={iconColor} />
          <KPIChangeIndicator change={change} />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${valueColor} group-hover:scale-105 transition-transform duration-300`}>
            {value}
          </p>
          {isCritical && (
            <p className="text-xs text-red-600 font-medium mt-1">
              ⚠️ Requires attention
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

