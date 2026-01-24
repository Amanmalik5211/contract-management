"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Layout } from "lucide-react";
import type { ContractStatus } from "@/types/contract";

interface StatusOverviewCardsProps {
  totalBlueprints: number;
  totalContracts: number;
  statusCounts: Record<ContractStatus, number>;
}

export function StatusOverviewCards({
  totalBlueprints,
  totalContracts,
  statusCounts,
}: StatusOverviewCardsProps) {
  return (
    <>
      <section className="mb-8 sm:mb-12">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
          <Card className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm sm:text-base font-medium mb-2 text-muted-foreground">Total Blueprints</div>
                  <div className="text-3xl sm:text-4xl font-bold group-hover:text-primary transition-colors duration-300">{totalBlueprints}</div>
                  <div className="text-sm sm:text-base mt-1 text-muted-foreground">available templates</div>
                </div>
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  <Layout className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary/15 group-hover:via-primary/8 transition-opacity duration-500" />
            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm sm:text-base font-medium mb-2 text-muted-foreground">Total Contracts</div>
                  <div className="text-3xl sm:text-4xl font-bold group-hover:text-primary transition-colors duration-300">{totalContracts}</div>
                  <div className="text-sm sm:text-base mt-1 text-muted-foreground">total contracts</div>
                </div>
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-8 sm:mb-12">
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-100" />
          <CardContent className="p-6 sm:p-8 relative z-10">
            <h3 className="text-lg sm:text-xl font-bold mb-6">Contract Status Overview</h3>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
              <div className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold">{statusCounts.created}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Created</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold">{statusCounts.approved}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Approved</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold">{statusCounts.sent}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Sent</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold">{statusCounts.signed}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Signed</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold">{statusCounts.locked}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Locked</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-bold">{statusCounts.revoked}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Revoked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

