"use client";

import { FileText, Activity, Clock, Layers } from "lucide-react";
import type { Contract } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";
import type { LucideIcon } from "lucide-react";
import { KPICard } from "./kpi-card";

interface KPICardsProps {
  contracts: Contract[];
  blueprints: Blueprint[];
}

interface KPIData {
  title: string;
  value: number;
  change: number | null;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  isCritical: boolean;
}

export function KPICards({ contracts, blueprints }: KPICardsProps) {
  // Calculate metrics
  const totalContracts = contracts.length;
  const totalBlueprints = blueprints.length;
  
  // Active contracts: signed, locked, sent (in progress)
  const activeContracts = contracts.filter(
    (c) => c.status === "signed" || c.status === "locked" || c.status === "sent"
  ).length;
  
  // Pending approval: created, approved (waiting for action)
  const pendingApproval = contracts.filter(
    (c) => c.status === "created" || c.status === "approved"
  ).length;
  
  // Calculate date ranges for metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const contractsLastMonth = contracts.filter(
    (c) => new Date(c.createdAt) >= thirtyDaysAgo
  ).length;
  
  const contractsPreviousMonth = contracts.filter(
    (c) => {
      const created = new Date(c.createdAt);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo;
    }
  ).length;

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : null; // 100% increase if we went from 0 to something
    }
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10;
  };

  // Calculate changes for each metric
  const totalChange = getPercentageChange(contractsLastMonth, contractsPreviousMonth);
  
  // For active contracts, calculate based on contracts that became active in last month
  const activeLastMonth = contracts.filter(
    (c) => {
      const created = new Date(c.createdAt);
      return created >= thirtyDaysAgo && (c.status === "signed" || c.status === "locked" || c.status === "sent");
    }
  ).length;
  
  const activePreviousMonth = contracts.filter(
    (c) => {
      const created = new Date(c.createdAt);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo && 
             (c.status === "signed" || c.status === "locked" || c.status === "sent");
    }
  ).length;
  
  const activeChange = getPercentageChange(activeLastMonth, activePreviousMonth);
  
  // For pending, calculate based on contracts in pending status
  const pendingLastMonth = contracts.filter(
    (c) => {
      const created = new Date(c.createdAt);
      return created >= thirtyDaysAgo && (c.status === "created" || c.status === "approved");
    }
  ).length;
  
  const pendingPreviousMonth = contracts.filter(
    (c) => {
      const created = new Date(c.createdAt);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo && 
             (c.status === "created" || c.status === "approved");
    }
  ).length;
  
  const pendingChange = getPercentageChange(pendingLastMonth, pendingPreviousMonth);
  
  // For blueprints, calculate based on blueprints created in last month vs previous month
  const blueprintsLastMonth = blueprints.filter(
    (bp) => new Date(bp.createdAt) >= thirtyDaysAgo
  ).length;
  
  const blueprintsPreviousMonth = blueprints.filter(
    (bp) => {
      const created = new Date(bp.createdAt);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo;
    }
  ).length;
  
  const blueprintsChange = getPercentageChange(blueprintsLastMonth, blueprintsPreviousMonth);

  const kpiData: KPIData[] = [
    {
      title: "Total Contracts",
      value: totalContracts,
      change: totalChange,
      icon: FileText,
      color: "primary",
      bgGradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      iconBg: "from-blue-500/20 to-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-foreground",
      isCritical: false,
    },
    {
      title: "Active Contracts",
      value: activeContracts,
      change: activeChange,
      icon: Activity,
      color: "success",
      bgGradient: "from-green-500/20 via-green-500/5 to-transparent",
      iconBg: "from-green-500/20 to-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      valueColor: "text-foreground",
      isCritical: false,
    },
    {
      title: "Pending Approval",
      value: pendingApproval,
      change: pendingChange,
      icon: Clock,
      color: "warning",
      bgGradient: "from-amber-500/20 via-amber-500/5 to-transparent",
      iconBg: "from-amber-500/20 to-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-foreground",
      isCritical: pendingApproval > 10,
    },
    {
      title: "Total Blueprints",
      value: totalBlueprints,
      change: blueprintsChange,
      icon: Layers,
      color: "primary",
      bgGradient: "from-purple-500/20 via-purple-500/5 to-transparent",
      iconBg: "from-purple-500/20 to-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      valueColor: "text-foreground",
      isCritical: false,
    },
  ];

  return (
    <section className="mb-8 sm:mb-12">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            bgGradient={kpi.bgGradient}
            iconBg={kpi.iconBg}
            iconColor={kpi.iconColor}
            valueColor={kpi.valueColor}
            isCritical={kpi.isCritical}
          />
        ))}
      </div>
    </section>
  );
}

