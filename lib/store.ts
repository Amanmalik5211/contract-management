"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Blueprint } from "@/types/blueprint";
import type { Contract, ContractStatus } from "@/types/contract";

// Serialized types for localStorage (dates as ISO strings)
type SerializedBlueprint = Omit<Blueprint, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  pdfFileName?: string;
  pdfUrl?: string;
  pageCount?: number;
};

type SerializedContract = Omit<Contract, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

// Custom storage adapter with quota error handling
const createSafeStorage = () => {
  const MAX_SIZE = 4 * 1024 * 1024; // 4MB safety limit (localStorage is typically 5-10MB)

  // Helper to estimate size of a string in bytes
  const getSize = (str: string): number => {
    return new Blob([str]).size;
  };

  // Helper to remove large base64 data from state to reduce size
  const removeLargeData = (state: any): any => {
    if (!state) return state;

    const cleaned = { ...state };

    // Remove base64 PDF URLs from blueprints (keep only metadata)
    if (cleaned.blueprints) {
      cleaned.blueprints = cleaned.blueprints.map((bp: any) => {
        const cleanedBp = { ...bp };
        // If pdfUrl is a base64 data URL, remove it (it's too large for localStorage)
        if (cleanedBp.pdfUrl && cleanedBp.pdfUrl.startsWith("data:")) {
          cleanedBp.pdfUrl = undefined;
        }
        return cleanedBp;
      });
    }

    // Remove base64 PDF URLs from contracts
    if (cleaned.contracts) {
      cleaned.contracts = cleaned.contracts.map((c: any) => {
        const cleanedC = { ...c };
        if (cleanedC.pdfUrl && cleanedC.pdfUrl.startsWith("data:")) {
          cleanedC.pdfUrl = undefined;
        }
        return cleanedC;
      });
    }

    return cleaned;
  };

  // Helper function to save with cleanup
  const setItemWithCleanup = (name: string, parsedData: any): void => {
    try {
      // Get current data to merge if needed
      let dataToSave = parsedData;
      
      if (!dataToSave) {
        try {
          const current = localStorage.getItem(name);
          if (current) {
            dataToSave = JSON.parse(current);
          }
        } catch {
          dataToSave = { blueprints: [], contracts: [] };
        }
      }

      // Remove large base64 data
      const cleaned = removeLargeData(dataToSave);
      
      // If still too large, keep only recent items
      if (cleaned.contracts && cleaned.contracts.length > 50) {
        cleaned.contracts = cleaned.contracts
          .sort((a: any, b: any) => 
            new Date(b.updatedAt || b.createdAt || 0).getTime() - 
            new Date(a.updatedAt || a.createdAt || 0).getTime()
          )
          .slice(0, 50);
      }
      
      if (cleaned.blueprints && cleaned.blueprints.length > 20) {
        cleaned.blueprints = cleaned.blueprints
          .sort((a: any, b: any) => 
            new Date(b.updatedAt || b.createdAt || 0).getTime() - 
            new Date(a.updatedAt || a.createdAt || 0).getTime()
          )
          .slice(0, 20);
      }

      const finalValue = JSON.stringify(cleaned);
      const finalSize = getSize(finalValue);
      
      if (finalSize > MAX_SIZE) {
        // Still too large even after cleanup - store minimal version
        const minimal = {
          blueprints: cleaned.blueprints?.slice(0, 10) || [],
          contracts: cleaned.contracts?.slice(0, 25) || [],
        };
        localStorage.setItem(name, JSON.stringify(minimal));
        console.error(
          "Storage quota critically exceeded. Only minimal data saved. " +
          "Please delete old contracts or blueprints immediately."
        );
        // Dispatch custom event for UI to handle
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("storage-quota-warning", {
            detail: { message: "Storage is full. Some data may not be saved." }
          }));
        }
      } else {
        localStorage.setItem(name, finalValue);
        if (cleaned.contracts?.length !== dataToSave?.contracts?.length || 
            cleaned.blueprints?.length !== dataToSave?.blueprints?.length) {
          console.warn(
            "Storage quota exceeded. Old data removed to free space."
          );
          // Dispatch warning event
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("storage-quota-warning", {
              detail: { message: "Storage is getting full. Some old data was removed." }
            }));
          }
        }
      }
    } catch (cleanupError: any) {
      // Last resort: if everything fails, just log and don't save
      console.error("Critical storage error. Data not saved:", cleanupError);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("storage-quota-error", {
          detail: { 
            message: "Unable to save data. Storage quota exceeded. Please clear browser storage or delete old items." 
          }
        }));
      }
    }
  };

  return {
    getItem: (name: string): string | null => {
      try {
        return localStorage.getItem(name);
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        // Check size before storing
        const size = getSize(value);
        
        if (size > MAX_SIZE) {
          // Try to clean large data and retry
          try {
            const parsed = JSON.parse(value);
            const cleaned = removeLargeData(parsed);
            const cleanedValue = JSON.stringify(cleaned);
            const cleanedSize = getSize(cleanedValue);

            if (cleanedSize > MAX_SIZE) {
              // Still too large, try removing old data
              return setItemWithCleanup(name, cleaned);
            }

            // Store cleaned version
            localStorage.setItem(name, cleanedValue);
            console.warn(
              "Large base64 data removed from storage to prevent quota errors. " +
              "PDFs and images stored as base64 will not persist."
            );
            return;
          } catch {
            // If parsing fails, try cleanup approach
            return setItemWithCleanup(name, null);
          }
        } else {
          localStorage.setItem(name, value);
        }
      } catch (error: any) {
        // Handle quota exceeded error
        if (error.name === "QuotaExceededError" || error.message?.includes("quota")) {
          // Try with cleanup
          setItemWithCleanup(name, null);
        } else {
          // For other errors, just log and continue
          console.error("Error saving to localStorage:", error);
        }
      }
    },
    removeItem: (name: string): void => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }
    },
  };
};

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
      storage: createJSONStorage(() => createSafeStorage()),
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
          const serializedState = state as unknown as {
            blueprints: SerializedBlueprint[];
            contracts: SerializedContract[];
          };
          state.blueprints = serializedState.blueprints.map((bp) => ({
            ...bp,
            sections: bp.sections || [], // Ensure sections array exists
            // PDF fields - optional, maintain backward compatibility
            pdfFileName: bp.pdfFileName || undefined,
            pdfUrl: bp.pdfUrl || undefined,
            pageCount: bp.pageCount || undefined,
            createdAt: new Date(bp.createdAt),
            updatedAt: new Date(bp.updatedAt),
          })) as Blueprint[];
          state.contracts = serializedState.contracts.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          })) as Contract[];
        }
      },
    }
  )
);

