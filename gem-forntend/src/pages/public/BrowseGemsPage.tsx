import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { gemsApi } from "@/api";
import GemCard from "@/components/gems/GemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GEM_CATEGORIES } from "@/lib/utils";

interface Filters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  minWeight: string;
  maxWeight: string;
  sort: string;
}

const defaultFilters: Filters = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  minWeight: "",
  maxWeight: "",
  sort: "newest",
};

export default function BrowseGemsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [applied, setApplied] = useState<Filters>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["gems", "public", applied, page],
    queryFn: () =>
      gemsApi
        .list({
          page,
          ...Object.fromEntries(
            Object.entries(applied).filter(
              ([, v]) => v !== "" && v !== "newest",
            ),
          ),
          ...(applied.sort !== "newest" ? { sort: applied.sort } : {}),
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const applyFilters = useCallback(() => {
    setApplied(filters);
    setPage(1);
    setSidebarOpen(false);
  }, [filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
    setApplied(defaultFilters);
    setPage(1);
  };

  const FilterPanel = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Category</label>
        <Select
          value={filters.category}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, category: v === "all" ? "" : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {GEM_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">
          Price Range (USD)
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minPrice: e.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxPrice: e.target.value }))
            }
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">
          Weight Range (carats)
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minWeight}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minWeight: e.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxWeight}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxWeight: e.target.value }))
            }
          />
        </div>
      </div>
      <Button className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
      <Button variant="ghost" className="w-full" onClick={clearFilters}>
        Clear All
      </Button>
    </div>
  );

  return (
    <div className="container py-8">
      {/* Search + Sort bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search gems..."
            className="pl-9"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>
        <Select
          value={filters.sort}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, sort: v }));
            setApplied((f) => ({ ...f, sort: v }));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="weight_asc">Weight: Low to High</SelectItem>
            <SelectItem value="weight_desc">Weight: High to Low</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-2 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-60 flex-shrink-0">
          <div className="sticky top-24 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-background p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : data?.gems?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No gems found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {data?.total ?? 0} gems found
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data?.gems?.map((gem: Record<string, unknown>) => (
                  <GemCard
                    key={gem.id as string}
                    gem={gem as Parameters<typeof GemCard>[0]["gem"]}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
