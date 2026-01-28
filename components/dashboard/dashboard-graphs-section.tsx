"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Contract } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";
import { format, subMonths, startOfMonth, eachMonthOfInterval } from "date-fns";

interface DashboardGraphsSectionProps {
  contracts: Contract[];
  blueprints: Blueprint[];
  viewType: "contract" | "blueprint";
}

const STATUS_COLORS = {
  Draft: "#3b82f6",
  Pending: "#f59e0b",
  Signed: "#10b981",
  Locked: "#6366f1",
  Rejected: "#ef4444",
};

export function DashboardGraphsSection({ contracts, blueprints, viewType }: DashboardGraphsSectionProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl px-2">
          {viewType === "contract" ? "Contract" : "Blueprint"} Analytics
        </h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground px-2">
          Visual insights into your {viewType === "contract" ? "contract" : "blueprint"} data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Graph 1: Contracts Over Time */}
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 rounded-2xl sm:rounded-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl sm:text-2xl">{dataType} Over Time</CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Growth trend over the last 6 months
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="w-full h-[250px] sm:h-[300px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemsOverTime} margin={{ bottom: 60, right: 10, top: 10, left: 10 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-[10px] sm:text-xs"
                    tick={{ fill: "currentColor", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tickFormatter={(value) => {
                      // Shorten month labels for better display
                      return value.length > 8 ? value.substring(0, 3) + ' ' + value.substring(value.length - 2) : value;
                    }}
                  />
                  <YAxis
                    tick={{ fill: "currentColor", fontSize: 10 }}
                    className="text-[10px] sm:text-xs"
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{
                      color: "hsl(var(--foreground))",
                    }}
                    itemStyle={{
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} className="hidden sm:block" />
                  <Bar dataKey={dataType.toLowerCase()} name={dataType} radius={[8, 8, 0, 0]} fill="#3b82f6" barSize={25}>
                    {itemsOverTime.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#3b82f6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Graph 2: Contract Status Distribution */}
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 rounded-2xl sm:rounded-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl sm:text-2xl">
              {viewType === "contract" ? "Status" : "Field Type"} Distribution
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {viewType === "contract" ? "Where contracts are in the pipeline" : "Field types used in blueprints"}
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="w-full h-[250px] sm:h-[300px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} margin={{ bottom: 60, right: 10, top: 10, left: 10 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-[10px] sm:text-xs"
                    tick={{ fill: "currentColor", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "currentColor", fontSize: 10 }}
                    className="text-[10px] sm:text-xs"
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={25}>
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={viewType === "contract" 
                          ? (STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || "#8884d8")
                          : ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981"][index % 4]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Graph 3: Signed vs Revoked */}
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 rounded-2xl sm:rounded-3xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl sm:text-2xl">
              {viewType === "contract" ? "Signed vs Revoked" : "With Fields vs Without"}
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {viewType === "contract" ? "Contract quality & effectiveness" : "Blueprint completeness"}
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="w-full h-[250px] sm:h-[300px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={comparison}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => {
                    if (isSmallScreen) {
                      return `${name}\n${value}`;
                    }
                    return `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`;
                  }}
                  outerRadius={isSmallScreen ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {comparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} className="hidden sm:block" />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

