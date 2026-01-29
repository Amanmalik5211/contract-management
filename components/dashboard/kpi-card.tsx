"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { KPIIconContainer } from "./kpi-icon-container";
import { KPIChangeIndicator } from "./kpi-change-indicator";
import { cn } from "@/lib/utils";

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
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-muted/60",
        isCritical && "border-red-500/50 ring-1 ring-red-500/20"
      )}
    >
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity duration-500",
          bgGradient
        )} 
      />
      
      <CardContent className="p-4 sm:p-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <KPIIconContainer icon={icon} iconBg={iconBg} iconColor={iconColor} />
          {change !== null && <KPIChangeIndicator change={change} />}
        </div>
        
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-[10px] sm:text-xs">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn("text-2xl sm:text-3xl font-bold tracking-tight", valueColor)}>
              {value.toLocaleString()}
            </h3>
          </div>
          
          {isCritical && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600 bg-red-50/50 dark:bg-red-900/10 px-2 py-0.5 rounded-md w-fit">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Attention Needed</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

