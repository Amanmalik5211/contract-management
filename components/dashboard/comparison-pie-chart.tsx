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

const CHART_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#06b6d4", // Cyan
];

interface ComparisonPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function ComparisonPieChart({ data }: ComparisonPieChartProps) {
  
  const chartConfig = React.useMemo(() => {
    return data.reduce((acc, curr, index) => {
        // Use provided color or fallback to chart loop
        const color = curr.color || CHART_COLORS[index % CHART_COLORS.length];
        acc[curr.name] = {
            label: curr.name,
            color: color, 
        };
        return acc;
    }, {} as ChartConfig);
  }, [data]);

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

