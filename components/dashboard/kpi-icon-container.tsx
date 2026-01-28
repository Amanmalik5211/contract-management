"use client";

import type { LucideIcon } from "lucide-react";

interface KPIIconContainerProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export function KPIIconContainer({ icon, iconBg, iconColor }: KPIIconContainerProps) {
  const Icon = icon;
  
  return (
    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${iconBg} group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg`}>
      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
    </div>
  );
}

