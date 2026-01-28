"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100 rounded-2xl sm:rounded-3xl" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          {description}
        </p>
      </CardHeader>
      <CardContent className="relative z-10">
        {children}
      </CardContent>
    </Card>
  );
}

