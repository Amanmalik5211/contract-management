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

interface ItemsOverTimeChartProps {
  data: Array<{ month: string; [key: string]: string | number }>;
  dataType: string;
}

export function ItemsOverTimeChart({ data, dataType }: ItemsOverTimeChartProps) {
  
  const chartConfig = React.useMemo(() => {
    return data.reduce((acc, curr, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        acc[curr.month] = {
            label: curr.month,
            color: color, 
        };
        return acc;
    }, {} as ChartConfig);
  }, [data]);

  const valueKey = dataType.toLowerCase();

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square min-h-[250px]">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey="month"
          innerRadius={60}
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
            />
          ))}
        </Pie>
        <ChartLegend 
            content={<ChartLegendContent nameKey="month" />} 
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" 
        />
      </PieChart>
    </ChartContainer>
  );
}

