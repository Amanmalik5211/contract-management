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
  "#3b82f6", 
  "#8b5cf6", 
  "#10b981", 
  "#f59e0b", 
  "#ef4444", 
  "#06b6d4", 
];

interface ComparisonPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function ComparisonPieChart({ data }: ComparisonPieChartProps) {
  
  const chartConfig = React.useMemo(() => {
    return data.reduce((acc, curr, index) => {
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

