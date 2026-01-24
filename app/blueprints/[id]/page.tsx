"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

export default function BlueprintViewPage() {
  const params = useParams();
  const router = useRouter();
  const { getBlueprint } = useStore();
  const blueprint = getBlueprint(params.id as string);

  if (!blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold break-words">{blueprint.name}</h1>
          {blueprint.description && (
            <p className="mt-2 text-sm break-words overflow-hidden">
              {blueprint.description}
            </p>
          )}
          <p className="mt-2 text-sm">
            Created {format(new Date(blueprint.createdAt), "MMM d, yyyy")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blueprint Fields</CardTitle>
          </CardHeader>
          <CardContent>
            {blueprint.fields.length === 0 ? (
              <p>No fields defined in this blueprint.</p>
            ) : (
              <div className="space-y-4">
                {blueprint.fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between rounded-md border p-4"
                  >
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="mt-1 text-sm">
                        Type: {field.type}
                      </div>
                    </div>
                    <Badge variant="secondary">{field.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Link href={`/contracts/new?blueprintId=${blueprint.id}`}>
            <Button>Create Contract from This Blueprint</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

