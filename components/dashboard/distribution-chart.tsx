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
  Draft: "#3b82f6",   
  Pending: "#f59e0b", 
  Signed: "#10b981",  
  Locked: "#6366f1",  
  Rejected: "#ef4444", 
};

const CHART_COLORS = [
  "#3b82f6", 
  "#8b5cf6", 
  "#10b981", 
  "#f59e0b", 
  "#ef4444", 
  "#06b6d4", 
];

interface DistributionChartProps {
  data: Array<{ name: string; value: number }>;
  viewType: "contract" | "blueprint";
}

export function DistributionChart({ data, viewType }: DistributionChartProps) {
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

