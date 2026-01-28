"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

interface PdfLoadingStateProps {
  className?: string;
}

export function PdfLoadingState({ className = "" }: PdfLoadingStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-center py-12">
        <Loader size="lg" text="Loading PDF..." />
      </CardContent>
    </Card>
  );
}

