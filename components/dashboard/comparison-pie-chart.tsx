"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ComparisonPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function ComparisonPieChart({ data }: ComparisonPieChartProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="w-full h-[250px] sm:h-[300px] md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
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
            {data.map((entry, index) => (
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
  );
}

