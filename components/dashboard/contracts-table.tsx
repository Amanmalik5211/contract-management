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
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: ContractsTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {viewType === "contract" ? (
              <>
                <TableHead>Contract Name</TableHead>
                <TableHead>Blueprint Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </>
            ) : (
              <>
                <TableHead>Blueprint Name</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
  );
}

