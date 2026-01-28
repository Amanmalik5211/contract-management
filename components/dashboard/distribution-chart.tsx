"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const STATUS_COLORS = {
  Draft: "#3b82f6",
  Pending: "#f59e0b",
  Signed: "#10b981",
  Locked: "#6366f1",
  Rejected: "#ef4444",
};

interface DistributionChartProps {
  data: Array<{ name: string; value: number }>;
  viewType: "contract" | "blueprint";
}

export function DistributionChart({ data, viewType }: DistributionChartProps) {
  return (
    <div className="w-full h-[250px] sm:h-[300px] md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ bottom: 60, right: 10, top: 10, left: 10 }} barCategoryGap="30%">
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
            {data.map((entry, index) => (
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
  );
}

