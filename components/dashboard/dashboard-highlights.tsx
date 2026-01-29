"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subMonths, startOfMonth, eachMonthOfInterval } from "date-fns";
import type { Contract } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";

interface DashboardHighlightsProps {
  contracts: Contract[];
  blueprints: Blueprint[];
}

export function DashboardHighlights({ contracts, blueprints }: DashboardHighlightsProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const twelveMonthsAgo = subMonths(now, 12);
    const months = eachMonthOfInterval({ start: twelveMonthsAgo, end: now });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const label = format(month, "MMM yy");

      const created = contracts.filter((c) => {
        const d = new Date(c.createdAt);
        return d >= monthStart && d <= monthEnd;
      }).length;

      const signed = contracts.filter((c) => {
        const d = new Date(c.updatedAt);
        return (c.status === "signed" || c.status === "locked") && d >= monthStart && d <= monthEnd;
      }).length;

      return {
        name: label,
        Created: created,
        Signed: signed,
      };
    });
  }, [contracts]);

  return (
    <Card className="rounded-xl sm:rounded-2xl md:rounded-3xl border-border/50 shadow-md mb-8">
      <CardHeader>
        <CardTitle>Contract Performance Trends</CardTitle>
        <CardDescription>Contracts created vs signed over the last 12 months</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={30}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line 
                type="monotone" 
                dataKey="Created" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Signed" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
