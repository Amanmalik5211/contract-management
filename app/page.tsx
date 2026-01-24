"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStatusLabel } from "@/lib/contract-utils";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Layout, Calendar, Pencil, Trash2, Search, X, Filter, ChevronDown } from "lucide-react";
import type { ContractStatus } from "@/types/contract";

export default function Dashboard() {
  const { contracts, blueprints, deleteContract } = useStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ContractStatus[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Calculate status counts
  const statusCounts = {
    created: contracts.filter((c) => c.status === "created").length,
    approved: contracts.filter((c) => c.status === "approved").length,
    sent: contracts.filter((c) => c.status === "sent").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    locked: contracts.filter((c) => c.status === "locked").length,
    revoked: contracts.filter((c) => c.status === "revoked").length,
  };

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let filtered = [...contracts];

    // Filter by status (multiple selection)
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((c) => selectedStatuses.includes(c.status));
    }

    // Filter by search query (contract name or blueprint name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.blueprintName.toLowerCase().includes(query)
      );
    }

    // Sort by updated date, most recent first
    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [contracts, selectedStatuses, searchQuery]);

  const handleStatusToggle = (status: ContractStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  // Close dropdown when clicking outside
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

  const handleEdit = (contractId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/contracts/${contractId}?edit=true`);
  };

  const handleDelete = (contractId: string, contractName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${contractName}"? This action cannot be undone.`)) {
      deleteContract(contractId);
    }
  };

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

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter Contracts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input and Filters in Same Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 space-y-2">
                <Label htmlFor="search">Search by Contract Name or Blueprint Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search contracts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filters Dropdown and Clear Button */}
              <div className="flex-1 space-y-2">
                <Label>Filter by Status</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1" ref={dropdownRef}>
                <Button
                  variant="outline"
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {selectedStatuses.length > 0 && (
                      <Badge className="ml-2 bg-blue-600 text-white">
                        {selectedStatuses.length}
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
                  <div className="absolute z-10 w-full mt-2 bg-white border rounded-md shadow-lg">
                    <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                      {statusOrder.map((status) => {
                        const count = statusCounts[status];
                        const isSelected = selectedStatuses.includes(status);
                        return (
                          <label
                            key={status}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleStatusToggle(status)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="flex-1 text-sm">
                              {getStatusLabel(status)}
                            </span>
                            <Badge className={getStatusColor(status)}>
                              {count}
                            </Badge>
                          </label>
                        );
                      })}
                    </div>
                    {selectedStatuses.length > 0 && (
                      <div className="border-t p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStatuses([])}
                          className="w-full text-sm"
                        >
                          Clear Selection
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                  </div>
                  {(searchQuery || selectedStatuses.length > 0) && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="flex-shrink-0"
                      title="Clear all filters"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contracts List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStatuses.length === 0
                ? "All Contracts"
                : selectedStatuses.length === 1
                ? `${getStatusLabel(selectedStatuses[0])} Contracts`
                : "Filtered Contracts"}
            </CardTitle>
            <p className="text-sm mt-1">
              {filteredContracts.length === 0
                ? "No contracts found"
                : `Showing ${filteredContracts.length} contract${filteredContracts.length !== 1 ? "s" : ""}`}
            </p>
          </CardHeader>
          <CardContent>
            {filteredContracts.length === 0 ? (
              <div className="py-12 text-center">
                <p>
                  {searchQuery || selectedStatuses.length > 0
                    ? "No contracts match your search or filter criteria."
                    : "No contracts found."}
                </p>
                {!searchQuery && selectedStatuses.length === 0 && (
                  <Link
                    href="/contracts/new"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Create your first contract
                  </Link>
                )}
                {(searchQuery || selectedStatuses.length > 0) && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContracts.map((contract) => {
                  const filledFieldsCount = contract.fields.filter((field) => {
                    const value = contract.fieldValues[field.id];
                    if (value === null || value === undefined) return false;
                    if (typeof value === "string" && value.trim() === "") return false;
                    if (typeof value === "boolean" && value === false) return false;
                    return true;
                  }).length;
                  const totalFields = contract.fields.length;
                  const canEdit = contract.status === "created";
                  const canDelete = contract.status === "created" || contract.status === "revoked";
                  
                  return (
                    <div
                      key={contract.id}
                      className="group relative p-4 border rounded-lg hover:shadow-md transition-colors overflow-hidden"
                    >
                      <Link
                        href={`/contracts/${contract.id}`}
                        className="block"
                      >
                        <div className="flex items-start justify-between gap-4 pb-12">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-lg break-words">{contract.name}</div>
                            {contract.blueprintDescription && (
                              <div className="text-sm mt-1 break-words whitespace-pre-wrap">
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
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => handleEdit(contract.id, e)}
                            title="Edit contract"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => handleDelete(contract.id, contract.name, e)}
                            title="Delete contract"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
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
