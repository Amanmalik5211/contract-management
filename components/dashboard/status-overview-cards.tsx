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
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium mb-1">Total Blueprints</div>
                <div className="text-3xl font-bold">{totalBlueprints}</div>
                <div className="text-sm mt-1">available templates</div>
              </div>
              <Layout className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium mb-1">Total Contracts</div>
                <div className="text-3xl font-bold">{totalContracts}</div>
                <div className="text-sm mt-1">total contracts</div>
              </div>
              <FileText className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contract Status Overview</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.created}</div>
              <div className="text-xs text-gray-600 mt-1">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.approved}</div>
              <div className="text-xs text-gray-600 mt-1">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.sent}</div>
              <div className="text-xs text-gray-600 mt-1">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.signed}</div>
              <div className="text-xs text-gray-600 mt-1">Signed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.locked}</div>
              <div className="text-xs text-gray-600 mt-1">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.revoked}</div>
              <div className="text-xs text-gray-600 mt-1">Revoked</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

