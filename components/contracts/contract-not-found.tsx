"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ContractNotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
          <p className="mb-4">The contract you are looking for does not exist.</p>
          <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
}

