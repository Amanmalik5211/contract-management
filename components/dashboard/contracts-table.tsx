"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractTableRow } from "./contract-table-row";
import { BlueprintTableRow } from "./blueprint-table-row";
import type { Contract } from "@/types/contract";
import type { Blueprint } from "@/types/blueprint";
import type { FieldType } from "@/types/field";

interface ContractsTableProps {
  viewType: "contract" | "blueprint";
  contracts: Contract[];
  blueprints: Blueprint[];
  fieldTypeLabels: Record<FieldType, string>;
  getStatusVariant: (status: string) => "default" | "secondary" | "destructive" | "success" | "warning";
  onView?: (id: string, e: React.MouseEvent) => void;
  onEdit: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, name: string, e: React.MouseEvent) => void;
  onStatusChange?: (contract: Contract, e: React.MouseEvent) => void;
}

export function ContractsTable({
  viewType,
  contracts,
  blueprints,
  fieldTypeLabels,
  getStatusVariant,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: ContractsTableProps) {
  return (
    <Card className="rounded-xl sm:rounded-2xl md:rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-lg overflow-hidden">
      <CardContent className="p-0 sm:p-2 md:p-4">
        <div className="overflow-x-auto -mx-2 sm:mx-0 max-w-full">
          <Table className="table-fixed min-w-[840px] caption-bottom text-sm">
            <TableHeader>
              <TableRow>
                {viewType === "contract" ? (
                  <>
                    <TableHead className="text-center text-xs sm:text-sm w-[180px] min-w-[180px]">Contract Name</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm w-[160px] min-w-[160px]">Blueprint Name</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm w-[100px] min-w-[100px]">Status</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm w-[120px] min-w-[120px]">Created Date</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm w-[100px] min-w-[100px]">Settings</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm w-[180px] min-w-[180px]">Actions</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-center text-xs sm:text-sm w-[200px] min-w-[200px]">Blueprint Name</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm w-[280px] min-w-[280px]">Fields</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm w-[140px] min-w-[140px]">Created Date</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm w-[180px] min-w-[180px]">Actions</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewType === "contract"
                ? contracts.map((contract) => (
                    <ContractTableRow
                      key={contract.id}
                      contract={contract}
                      getStatusVariant={getStatusVariant}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                    />
                  ))
                : blueprints.map((blueprint) => (
                    <BlueprintTableRow
                      key={blueprint.id}
                      blueprint={blueprint}
                      fieldTypeLabels={fieldTypeLabels}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

