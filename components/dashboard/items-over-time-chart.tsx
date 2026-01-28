"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ItemsOverTimeChartProps {
  data: Array<{ month: string; [key: string]: string | number }>;
  dataType: string;
}

export function ItemsOverTimeChart({ data, dataType }: ItemsOverTimeChartProps) {
  return (
    <div className="w-full h-[250px] sm:h-[300px] md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ bottom: 60, right: 10, top: 10, left: 10 }} barCategoryGap="30%">
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#3b82f6" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

