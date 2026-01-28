"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateCardProps {
  viewType: "contract" | "blueprint";
  searchQuery: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyStateCard({
  viewType,
  searchQuery,
  hasFilters,
  onClearFilters,
}: EmptyStateCardProps) {
  const itemType = viewType === "contract" ? "contracts" : "blueprints";

  return (
    <Card className="rounded-2xl sm:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg">
      <CardContent className="py-12 text-center">
        <p className="text-base sm:text-lg text-muted-foreground">
          {searchQuery || hasFilters
            ? `No ${itemType} match your search or filter criteria.`
            : `No ${itemType} found.`}
        </p>
        {!searchQuery && !hasFilters && viewType === "contract" && (
          <Link href="/contracts/new" className="mt-4 inline-block">
            <Button size="lg">Create your first contract</Button>
          </Link>
        )}
        {(searchQuery || hasFilters) && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

