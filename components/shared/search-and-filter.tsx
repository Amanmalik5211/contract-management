"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ListFilter, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SearchAndFilterProps } from "@/types/components";

export function SearchAndFilter<T extends string>(props: SearchAndFilterProps<T>) {
  const {
    searchQuery,
    onSearchChange,
    selectedFilters,
    onClearFilters,
    searchPlaceholder = "Search",
    showToggle = false,
    toggleValue = "contract",
    onToggleChange,
    filterOptions = [],
    onFilterToggle,
  } = props;

  const hasActiveFilters = searchQuery.trim() !== "" || selectedFilters.length > 0;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-row flex-wrap sm:flex-nowrap gap-3 sm:gap-4 items-center">
        <div className="w-full sm:w-auto sm:flex-1 relative">
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
          <Tabs
            value={toggleValue as string}
            onValueChange={(val) => onToggleChange(val as any)}
            className="shrink-0 border border-border rounded-xl light:bg-gray-100 sm:rounded-2xl"
          >
            <TabsList className="h-11 sm:h-12 w-auto bg-muted/60 p-1 rounded-xl sm:rounded-2xl">
              <TabsTrigger
                value="contract"
                className="h-full rounded-lg px-4 sm:px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Contract
              </TabsTrigger>
              <TabsTrigger
                value="blueprint"
                className="h-full rounded-lg px-4 sm:px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Blueprint
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {filterOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2  h-11 sm:h-12 border-dashed shrink-0 rounded-xl sm:rounded-2xl px-3 sm:px-4"
              >
                <ListFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                {selectedFilters.length > 0 && (
                  <span className="ml-0.5 rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium border border-border">
                    {selectedFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                Filter by {toggleValue === "contract" ? "Status" : "Type"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedFilters.includes(option.value)}
                  onCheckedChange={() => onFilterToggle && onFilterToggle(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-11  sm:h-12 gap-2 text-muted-foreground hover:text-destructive shrink-0 rounded-xl sm:rounded-2xl"
          >
            <X className="h-4 w-4 text-red-500" />
            <span className="hidden text-red-500 sm:inline">Clear Filters</span>
          </Button>
        )}
      </div>


    </div>
  );
}

