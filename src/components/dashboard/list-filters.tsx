"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface ListFiltersProps {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  showDateRange?: boolean;
}

export function ListFilters({ 
  searchPlaceholder = "Buscar...",
  filters = [],
  showDateRange = false
}: ListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for controlled inputs
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    filters.forEach(f => {
      initial[f.key] = searchParams.get(f.key) || "";
    });
    return initial;
  });

  // Update URL with new params
  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (search !== currentSearch) {
        updateParams({ search });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, searchParams, updateParams]);

  // Handle filter change
  function handleFilterChange(key: string, value: string) {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    updateParams({ [key]: value });
  }

  // Handle date change
  function handleDateChange(field: "dateFrom" | "dateTo", value: string) {
    if (field === "dateFrom") {
      setDateFrom(value);
    } else {
      setDateTo(value);
    }
    updateParams({ [field]: value });
  }

  // Clear all filters
  function clearFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setFilterValues(filters.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {}));
    router.push(pathname);
  }

  const hasActiveFilters = search || dateFrom || dateTo || Object.values(filterValues).some(v => v);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Dynamic Filters */}
      {filters.map((filter) => (
        <Select 
          key={filter.key} 
          value={filterValues[filter.key] || ""} 
          onValueChange={(v) => handleFilterChange(filter.key, v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Date Range */}
      {showDateRange && (
        <>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateChange("dateFrom", e.target.value)}
            className="w-[140px]"
            placeholder="Desde"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateChange("dateTo", e.target.value)}
            className="w-[140px]"
            placeholder="Hasta"
          />
        </>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
