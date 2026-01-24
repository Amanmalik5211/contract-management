"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Blueprint } from "@/types/blueprint";
import type { Contract, ContractStatus } from "@/types/contract";

interface AppState {
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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      blueprints: [],
      contracts: [],
      
      addBlueprint: (blueprint) =>
        set((state) => ({
          blueprints: [...state.blueprints, blueprint],
        })),
      
      updateBlueprint: (id, updates) =>
        set((state) => ({
          blueprints: state.blueprints.map((bp) =>
            bp.id === id ? { ...bp, ...updates, updatedAt: new Date() } : bp
          ),
        })),
      
      deleteBlueprint: (id) =>
        set((state) => ({
          blueprints: state.blueprints.filter((bp) => bp.id !== id),
        })),
      
      getBlueprint: (id) => get().blueprints.find((bp) => bp.id === id),
      
      addContract: (contract) =>
        set((state) => ({
          contracts: [...state.contracts, contract],
        })),
      
      updateContract: (id, updates) =>
        set((state) => ({
          contracts: state.contracts.map((contract) =>
            contract.id === id
              ? { ...contract, ...updates, updatedAt: new Date() }
              : contract
          ),
        })),
      
      updateContractStatus: (id, status) =>
        set((state) => ({
          contracts: state.contracts.map((contract) =>
            contract.id === id
              ? { ...contract, status, updatedAt: new Date() }
              : contract
          ),
        })),
      
      deleteContract: (id) =>
        set((state) => ({
          contracts: state.contracts.filter((contract) => contract.id !== id),
        })),
      
      getContract: (id) => get().contracts.find((c) => c.id === id),
      
      getContractsByStatus: (status) =>
        get().contracts.filter((c) => c.status === status),
    }),
    {
      name: "contract-management-storage",
      partialize: (state) => ({
        blueprints: state.blueprints.map((bp) => ({
          ...bp,
          createdAt: bp.createdAt.toISOString(),
          updatedAt: bp.updatedAt.toISOString(),
        })),
        contracts: state.contracts.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.blueprints = state.blueprints.map((bp: any) => ({
            ...bp,
            sections: bp.sections || [], // Ensure sections array exists
            createdAt: new Date(bp.createdAt),
            updatedAt: new Date(bp.updatedAt),
          }));
          state.contracts = state.contracts.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          }));
        }
      },
    }
  )
);

