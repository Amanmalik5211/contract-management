"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PdfErrorStateProps } from "@/types/components";

export function PdfErrorState({ error, className = "" }: PdfErrorStateProps) {
  return (
    <Card className={className}>
      <CardContent className="py-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">Error Loading PDF</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </CardContent>
    </Card>
  );
}

