"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BlueprintNotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Blueprint Not Found</h2>
          <p className="mb-4">The blueprint you are looking for does not exist.</p>
          <Button onClick={() => router.push("/blueprints")}>Go to Blueprints</Button>
        </CardContent>
      </Card>
    </div>
  );
}

