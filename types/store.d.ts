import type { Blueprint } from "./blueprint";
import type { Contract, ContractStatus } from "./contract";

// Serialized types for localStorage (dates as ISO strings)
export type SerializedBlueprint = Omit<Blueprint, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  pdfFileName?: string;
  pdfUrl?: string;
  pageCount?: number;
};

export type SerializedContract = Omit<Contract, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export interface AppState {
  blueprints: Blueprint[];
  contracts: Contract[];
  
  // Blueprint actions
  addBlueprint: (blueprint: Blueprint) => void;
  updateBlueprint: (id: string, updates: Partial<Blueprint>) => void;
  deleteBlueprint: (id: string) => void;
  getBlueprint: (id: string) => Blueprint | undefined;
  
  // Contract actions
  addContract: (contract: Contract) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  updateContractStatus: (id: string, status: ContractStatus) => void;
  deleteContract: (id: string) => void;
  getContract: (id: string) => Contract | undefined;
  getContractsByStatus: (status: ContractStatus) => Contract[];
}


