"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Blueprint } from "@/types/blueprint";
import type { Contract, ContractStatus } from "@/types/contract";
import type { SerializedBlueprint, SerializedContract, AppState } from "@/types/store";

// Custom storage adapter with quota error handling
const createSafeStorage = () => {
  const MAX_SIZE = 4 * 1024 * 1024; // 4MB safety limit (localStorage is typically 5-10MB)
  const warnedKeys = new Set<string>();
  const byMostRecent = (a: unknown, b: unknown) => {
    const ar = a as Record<string, unknown>;
    const br = b as Record<string, unknown>;
    const aTime = new Date((ar.updatedAt as string) || (ar.createdAt as string) || 0).getTime();
    const bTime = new Date((br.updatedAt as string) || (br.createdAt as string) || 0).getTime();
    return bTime - aTime;
  };

  // Helper to estimate size of a string in bytes
  const getSize = (str: string): number => {
    return new Blob([str]).size;
  };

  // Helper to remove large base64 data from state to reduce size
  const removeLargeData = (state: unknown): unknown => {
    if (!state) return state;

    const cleaned = { ...(state as Record<string, unknown>) };

    // Remove base64 PDF URLs from blueprints (keep only metadata)
    if (Array.isArray(cleaned.blueprints)) {
      cleaned.blueprints = (cleaned.blueprints as Array<Record<string, unknown>>).map((bp) => {
        const cleanedBp = { ...bp } as Record<string, unknown>;
        // If pdfUrl is a base64 data URL, remove it (it's too large for localStorage)
        if (typeof cleanedBp.pdfUrl === "string" && cleanedBp.pdfUrl.startsWith("data:")) {
          cleanedBp.pdfUrl = undefined;
        }
        return cleanedBp;
      });
    }

    // Remove base64 PDF URLs from contracts
    if (Array.isArray(cleaned.contracts)) {
      cleaned.contracts = (cleaned.contracts as Array<Record<string, unknown>>).map((c) => {
        const cleanedC = { ...c } as Record<string, unknown>;
        if (typeof cleanedC.pdfUrl === "string" && cleanedC.pdfUrl.startsWith("data:")) {
          cleanedC.pdfUrl = undefined;
        }
        return cleanedC;
      });
    }

    return cleaned;
  };

  // Helper function to save with cleanup
  const setItemWithCleanup = (name: string, parsedData: unknown): void => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      // Get current data to merge if needed
      let dataToSave: unknown = parsedData;
      
      if (!dataToSave) {
        try {
          const current = localStorage.getItem(name);
          if (current) {
            dataToSave = JSON.parse(current) as unknown;
          }
        } catch {
          dataToSave = { blueprints: [], contracts: [] } as unknown;
        }
      }

      // Remove large base64 data
      const cleaned = removeLargeData(dataToSave);
      
      // If still too large, keep only recent items
      if (Array.isArray((cleaned as Record<string, unknown>).contracts) && ((cleaned as Record<string, unknown>).contracts as unknown[]).length > 50) {
        (cleaned as Record<string, unknown>).contracts = ((cleaned as Record<string, unknown>).contracts as Array<Record<string, unknown>>)
          .sort((a, b) => 
            new Date((b.updatedAt as string) || (b.createdAt as string) || 0).getTime() - 
            new Date((a.updatedAt as string) || (a.createdAt as string) || 0).getTime()
          )
          .slice(0, 50);
      }
      
      if (Array.isArray((cleaned as Record<string, unknown>).blueprints) && ((cleaned as Record<string, unknown>).blueprints as unknown[]).length > 20) {
        (cleaned as Record<string, unknown>).blueprints = ((cleaned as Record<string, unknown>).blueprints as Array<Record<string, unknown>>)
          .sort((a, b) => 
            new Date((b.updatedAt as string) || (b.createdAt as string) || 0).getTime() - 
            new Date((a.updatedAt as string) || (a.createdAt as string) || 0).getTime()
          )
          .slice(0, 20);
      }

      const cleanedRecord = cleaned as Record<string, unknown>;

      const finalValue = JSON.stringify(cleanedRecord);
      const finalSize = getSize(finalValue);
      
      if (finalSize > MAX_SIZE) {
        // Still too large even after cleanup - store minimal version
        const recentBlueprints = Array.isArray(cleanedRecord.blueprints)
          ? [...cleanedRecord.blueprints].sort(byMostRecent).slice(0, 10)
          : [];
        const recentContracts = Array.isArray(cleanedRecord.contracts)
          ? [...cleanedRecord.contracts].sort(byMostRecent).slice(0, 25)
          : [];
        const minimal = {
          blueprints: recentBlueprints,
          contracts: recentContracts,
        };
        localStorage.setItem(name, JSON.stringify(minimal));
        if (!warnedKeys.has(name)) {
          warnedKeys.add(name);
          console.warn(
            "Storage quota critically exceeded. Only minimal data saved. " +
            "Please delete old contracts or blueprints immediately."
          );
        }
        // Dispatch custom event for UI to handle
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("storage-quota-warning", {
            detail: { message: "Storage is full. Some data may not be saved." }
          }));
        }
      } else {
        localStorage.setItem(name, finalValue);
        const cleanedContractsLen = Array.isArray((cleaned as Record<string, unknown>).contracts) ? ((cleaned as Record<string, unknown>).contracts as unknown[]).length : undefined;
        const cleanedBlueprintsLen = Array.isArray((cleaned as Record<string, unknown>).blueprints) ? ((cleaned as Record<string, unknown>).blueprints as unknown[]).length : undefined;
        const originalContractsLen = Array.isArray((dataToSave as Record<string, unknown> | null)?.contracts) ? (((dataToSave as Record<string, unknown>).contracts) as unknown[]).length : undefined;
        const originalBlueprintsLen = Array.isArray((dataToSave as Record<string, unknown> | null)?.blueprints) ? (((dataToSave as Record<string, unknown>).blueprints) as unknown[]).length : undefined;
        if (cleanedContractsLen !== originalContractsLen || cleanedBlueprintsLen !== originalBlueprintsLen) {
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
    } catch (cleanupError: unknown) {
      // Last resort: if everything fails, just log and don't save
      const cleanupErrorMessage =
        cleanupError instanceof Error
          ? cleanupError.message
          : typeof cleanupError === "string"
            ? cleanupError
            : "Unknown error";
      console.error("Critical storage error. Data not saved:", cleanupErrorMessage, cleanupError);
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
      if (typeof window === "undefined") {
        return null;
      }
      try {
        return localStorage.getItem(name);
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      if (typeof window === "undefined") {
        return;
      }
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
      } catch (error: unknown) {
        // Handle quota exceeded error
        const message = error instanceof Error ? error.message : "";
        const name = error instanceof Error ? error.name : "";
        if (name === "QuotaExceededError" || message.includes("quota")) {
          // Try with cleanup
          setItemWithCleanup(name, null);
        } else {
          // For other errors, just log and continue
          console.error("Error saving to localStorage:", error);
        }
      }
    },
    removeItem: (name: string): void => {
      if (typeof window === "undefined") {
        return;
      }
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }
    },
  };
};

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

