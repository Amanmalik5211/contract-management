import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const STATUS_COLORS = {
  Draft: "#3b82f6",   // Blue
  Pending: "#f59e0b", // Amber
  Signed: "#10b981",  // Emerald
  Locked: "#6366f1",  // Indigo
  Rejected: "#ef4444", // Red
};

const CHART_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#06b6d4", // Cyan
];

interface DistributionChartProps {
  data: Array<{ name: string; value: number }>;
  viewType: "contract" | "blueprint";
}

export function DistributionChart({ data, viewType }: DistributionChartProps) {
  // Construct config dynamically
  const chartConfig = React.useMemo(() => {
    return data.reduce((acc, curr, index) => {
        let color;
        if (viewType === "contract") {
            color = STATUS_COLORS[curr.name as keyof typeof STATUS_COLORS] || CHART_COLORS[index % CHART_COLORS.length];
        } else {
            color = CHART_COLORS[index % CHART_COLORS.length];
        }
        acc[curr.name] = {
            label: curr.name,
            color: color,
        };
        return acc;
    }, {} as ChartConfig);
  }, [data, viewType]);

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square min-h-[250px]">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell 
                key={`cell-${index}`} 
                fill={chartConfig[entry.name]?.color} 
            />
          ))}
        </Pie>
        <ChartLegend 
            content={<ChartLegendContent nameKey="name" />} 
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" 
        />
      </PieChart>
    </ChartContainer>
  );
}

