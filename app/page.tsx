"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/contract-utils";
import { format } from "date-fns";
import Link from "next/link";
import { FileText, Layout, Calendar } from "lucide-react";
import type { ContractStatus } from "@/types/contract";

export default function Dashboard() {
  const { contracts, blueprints } = useStore();

  // Calculate status counts
  const statusCounts = {
    created: contracts.filter((c) => c.status === "created").length,
    approved: contracts.filter((c) => c.status === "approved").length,
    sent: contracts.filter((c) => c.status === "sent").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    locked: contracts.filter((c) => c.status === "locked").length,
    revoked: contracts.filter((c) => c.status === "revoked").length,
  };

  // Get recent contracts (sorted by updated date, most recent first)
  const recentContracts = [...contracts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-purple-100 text-purple-800";
      case "signed":
        return "bg-teal-100 text-teal-800";
      case "locked":
        return "bg-orange-100 text-orange-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBarColor = (status: ContractStatus) => {
    switch (status) {
      case "created":
        return "bg-blue-200";
      case "approved":
        return "bg-green-200";
      case "sent":
        return "bg-purple-200";
      case "signed":
        return "bg-teal-200";
      case "locked":
        return "bg-orange-200";
      case "revoked":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };

  const statusOrder: ContractStatus[] = [
    "created",
    "approved",
    "sent",
    "signed",
    "locked",
    "revoked",
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2">Overview of your contracts and templates</p>
        </div>

        {/* Total Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium mb-1">Total Blueprints</div>
                  <div className="text-3xl font-bold">{blueprints.length}</div>
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
                  <div className="text-3xl font-bold">{contracts.length}</div>
                  <div className="text-sm mt-1">total contracts</div>
                </div>
                <FileText className="h-8 w-8 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Status Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contract Status Overview</CardTitle>
            <p className="text-sm mt-1">Distribution of contracts by lifecycle status</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {statusOrder.map((status) => {
                const count = statusCounts[status];
                return (
                  <div
                    key={status}
                    className={`rounded-lg p-4 border-2 ${getStatusBarColor(status)} border-opacity-50 overflow-hidden`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{count}</div>
                      <div className="text-xs font-medium break-words">{getStatusLabel(status)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Contracts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Contracts</CardTitle>
            <p className="text-sm mt-1">Latest contracts created or modified</p>
          </CardHeader>
          <CardContent>
            {recentContracts.length === 0 ? (
              <div className="py-12 text-center">
                <p>No contracts found.</p>
                <Link
                  href="/contracts/new"
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Create your first contract
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentContracts.map((contract) => {
                  const filledFieldsCount = Object.keys(contract.fieldValues).filter(
                    (key) => contract.fieldValues[key] !== null && contract.fieldValues[key] !== ""
                  ).length;
                  const totalFields = contract.fields.length;
                  
                  return (
                    <Link
                      key={contract.id}
                      href={`/contracts/${contract.id}`}
                      className="block p-4 border rounded-lg hover:shadow-md transition-colors cursor-pointer overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-lg break-words">{contract.name}</div>
                          {contract.blueprintDescription && (
                            <div className="text-sm mt-1 break-words overflow-hidden">
                              {contract.blueprintDescription}
                            </div>
                          )}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Layout className="h-4 w-4 flex-shrink-0" />
                              <span className="break-words">Blueprint: {contract.blueprintName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="break-words">Created: {format(new Date(contract.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 flex-shrink-0" />
                              <span className="break-words">
                                <span className="font-medium">{filledFieldsCount}</span> of{" "}
                                <span className="font-medium">{totalFields}</span> fields filled
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <Badge className={getStatusColor(contract.status)}>
                            {getStatusLabel(contract.status)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
