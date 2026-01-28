"use client";

import { useMemo } from "react";
import type { Contract } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";
import { format, subMonths, startOfMonth, eachMonthOfInterval } from "date-fns";
import { DashboardGraphsHeader } from "./dashboard-graphs-header";
import { ChartCard } from "./chart-card";
import { ItemsOverTimeChart } from "./items-over-time-chart";
import { DistributionChart } from "./distribution-chart";
import { ComparisonPieChart } from "./comparison-pie-chart";

interface DashboardGraphsSectionProps {
  contracts: Contract[];
  blueprints: Blueprint[];
  viewType: "contract" | "blueprint";
}

export function DashboardGraphsSection({ contracts, blueprints, viewType }: DashboardGraphsSectionProps) {

  const data = viewType === "contract" ? contracts : blueprints;
  const dataType = viewType === "contract" ? "Contracts" : "Blueprints";

  // Graph 1: Contracts/Blueprints Over Time
  const itemsOverTime = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const itemsInMonth = data.filter((item) => {
        const created = new Date(item.createdAt);
        return created >= monthStart && created <= monthEnd;
      }).length;

      return {
        month: format(month, "MMM yyyy"),
        [dataType.toLowerCase()]: itemsInMonth,
      };
    });
  }, [data, dataType]);

  // Graph 2: Status Distribution (for contracts) or Field Type Distribution (for blueprints)
  const distribution = useMemo(() => {
    if (viewType === "contract") {
      const statusMap = {
        Draft: contracts.filter((c) => c.status === "created").length,
        Pending: contracts.filter((c) => c.status === "approved" || c.status === "sent").length,
        Signed: contracts.filter((c) => c.status === "signed").length,
        Locked: contracts.filter((c) => c.status === "locked").length,
        Rejected: contracts.filter((c) => c.status === "revoked").length,
      };
      return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
    } else {
      const fieldTypeMap: Record<string, number> = {};
      blueprints.forEach((bp) => {
        bp.fields.forEach((field) => {
          fieldTypeMap[field.type] = (fieldTypeMap[field.type] || 0) + 1;
        });
      });
      return Object.entries(fieldTypeMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    }
  }, [contracts, blueprints, viewType]);

  // Graph 3: Signed vs Revoked (for contracts) or Active vs Inactive (for blueprints)
  const comparison = useMemo(() => {
    if (viewType === "contract") {
      const signed = contracts.filter((c) => c.status === "signed" || c.status === "locked").length;
      const revoked = contracts.filter((c) => c.status === "revoked").length;
      return [
        { name: "Signed", value: signed, color: "#10b981" },
        { name: "Revoked", value: revoked, color: "#ef4444" },
      ];
    } else {
      const withFields = blueprints.filter((bp) => bp.fields.length > 0).length;
      const withoutFields = blueprints.filter((bp) => bp.fields.length === 0).length;
      return [
        { name: "With Fields", value: withFields, color: "#10b981" },
        { name: "Without Fields", value: withoutFields, color: "#ef4444" },
      ];
    }
  }, [contracts, blueprints, viewType]);

  return (
    <section className="py-6 sm:py-8 mb-8">
      <DashboardGraphsHeader viewType={viewType} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <ChartCard
          title={`${dataType} Over Time`}
          description="Growth trend over the last 6 months"
        >
          <ItemsOverTimeChart data={itemsOverTime} dataType={dataType} />
        </ChartCard>

        <ChartCard
          title={viewType === "contract" ? "Status Distribution" : "Field Type Distribution"}
          description={viewType === "contract" ? "Where contracts are in the pipeline" : "Field types used in blueprints"}
        >
          <DistributionChart data={distribution} viewType={viewType} />
        </ChartCard>

        <ChartCard
          title={viewType === "contract" ? "Signed vs Revoked" : "With Fields vs Without"}
          description={viewType === "contract" ? "Contract quality & effectiveness" : "Blueprint completeness"}
        >
          <ComparisonPieChart data={comparison} />
        </ChartCard>
      </div>
    </section>
  );
}

