"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchAndFilterProps<T extends string> {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: T[];
  onClearFilters: () => void;
  searchPlaceholder?: string;
  showToggle?: boolean;
  toggleValue?: "contract" | "blueprint";
  onToggleChange?: (value: "contract" | "blueprint") => void;
  // Legacy props - kept for backward compatibility but not used
  onFilterToggle?: (filter: T) => void;
  filterOptions?: Array<{ value: T; label: string }>;
  filterLabel?: string;
}

export function SearchAndFilter<T extends string>(props: SearchAndFilterProps<T>) {
  const {
    searchQuery,
    onSearchChange,
    selectedFilters,
    onClearFilters,
    searchPlaceholder = "Search...",
    showToggle = false,
    toggleValue = "contract",
    onToggleChange,
  } = props;

  const hasActiveFilters = searchQuery.trim() !== "" || selectedFilters.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 " />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 sm:pl-12 h-11 sm:h-12 rounded-xl sm:rounded-2xl   transition-colors focus:border-gray-400 dark:focus:border-gray-600"
        />
      </div>
      {showToggle && onToggleChange && (
        <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-xl sm:rounded-2xl p-1 h-11 sm:h-12">
          <button
            onClick={() => onToggleChange("contract")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all border border-gray-300 dark:border-gray-700 ${
              toggleValue === "contract"
                ? "bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 "
            }`}
          >
            Contract
          </button>
          <button
            onClick={() => onToggleChange("blueprint")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all border border-gray-300 dark:border-gray-700 ${
              toggleValue === "blueprint"
                ? "bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            Blueprint
          </button>
        </div>
      )}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex items-center gap-2 h-9 sm:h-9 rounded-xl sm:rounded-2xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 text-black dark:text-white transition-colors focus:border-gray-400 dark:focus:border-gray-600"
        >
          <X className="h-2 w-2 sm:h-3 sm:w-3" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

