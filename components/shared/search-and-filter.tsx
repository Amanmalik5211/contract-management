"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, ChevronDown } from "lucide-react";

interface SearchAndFilterProps<T extends string> {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: T[];
  onFilterToggle: (filter: T) => void;
  onClearFilters: () => void;
  filterOptions: Array<{ value: T; label: string }>;
  searchPlaceholder?: string;
  filterLabel?: string;
}

export function SearchAndFilter<T extends string>({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterToggle,
  onClearFilters,
  filterOptions,
  searchPlaceholder = "Search...",
  filterLabel = "Filters",
}: SearchAndFilterProps<T>) {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedFilters.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="relative z-50" ref={dropdownRef}>
        <Button
          variant="outline"
          onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          className="w-full sm:w-auto justify-between relative z-10"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {filterLabel}
            {selectedFilters.length > 0 && (
              <Badge className="ml-2 bg-blue-600 text-white">
                {selectedFilters.length}
              </Badge>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isFilterDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
        {isFilterDropdownOpen && (
          <div className="absolute z-[100] top-full left-0 right-0 sm:right-auto mt-2 w-full sm:w-64 bg-background border border-border rounded-lg shadow-xl">
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {filterOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(option.value)}
                    onChange={() => onFilterToggle(option.value)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

