"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Activity, Clock, Layers, TrendingUp, TrendingDown } from "lucide-react";
import type { Contract } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";

interface KPICardsProps {
  contracts: Contract[];
  blueprints: Blueprint[];
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
      const updated = new Date(c.updatedAt);
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

  const kpiData = [
    {
      title: "Total Contracts",
      value: totalContracts,
      change: totalChange,
      icon: FileText,
      color: "primary",
      bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconBg: "from-blue-500/20 to-blue-500/10",
      iconColor: "text-blue-600",
      valueColor: "text-blue-600",
    },
    {
      title: "Active Contracts",
      value: activeContracts,
      change: activeChange,
      icon: Activity,
      color: "success",
      bgGradient: "from-green-500/10 via-green-500/5 to-transparent",
      iconBg: "from-green-500/20 to-green-500/10",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      title: "Pending Approval",
      value: pendingApproval,
      change: pendingChange,
      icon: Clock,
      color: "warning",
      bgGradient: "from-yellow-500/10 via-yellow-500/5 to-transparent",
      iconBg: "from-yellow-500/20 to-yellow-500/10",
      iconColor: "text-yellow-600",
      valueColor: "text-yellow-600",
    },
    {
      title: "Total Blueprints",
      value: totalBlueprints,
      change: blueprintsChange,
      icon: Layers,
      color: "primary",
      bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      iconBg: "from-purple-500/20 to-purple-500/10",
      iconColor: "text-purple-600",
      valueColor: "text-purple-600",
    },
  ];

  return (
    <section className="mb-8 sm:mb-12">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change !== null && kpi.change > 0;
          const isNegative = kpi.change !== null && kpi.change < 0;

          return (
            <Card
              key={kpi.title}
              className={`group relative overflow-hidden ${
                kpi.isCritical ? "ring-2 ring-red-500/50" : ""
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGradient} opacity-100 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${kpi.iconBg} group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${kpi.iconColor}`} />
                  </div>
                  {kpi.change !== null && (
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
                        {kpi.change}%
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    {kpi.title}
                  </p>
                  <p className={`text-2xl sm:text-3xl font-bold ${kpi.valueColor} group-hover:scale-105 transition-transform duration-300`}>
                    {kpi.value}
                  </p>
                  {kpi.isCritical && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      ⚠️ Requires attention
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

