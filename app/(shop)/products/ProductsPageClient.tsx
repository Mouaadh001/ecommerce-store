"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Product, Category } from "@/types";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "new", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "featured", label: "Featured" },
];

export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "new");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase.from("products").select("*, category:categories(*)");

    if (search) query = query.ilike("name", `%${search}%`);
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (sort === "featured") query = query.eq("featured", true);
    else if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data } = await query.limit(48);
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }, [search, selectedCategory, sort, categories]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("*").then(({ data }) => {
      setCategories((data as Category[]) ?? []);
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fetchProducts();
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, sort]);

  const clearAll = () => {
    setSelectedCategory("");
    setSort("new");
    setSearch("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Products</h1>
        <p className="text-muted-foreground mt-1">
          {loading ? "Loading..." : `${products.length} products`}
        </p>
      </div>

      {/* Search + Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="product-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground sm:flex-none"
            aria-label="Sort products"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-label="Toggle filters"
            className={cn(filtersOpen && "bg-muted")}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {(selectedCategory || sort !== "new") && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedCategory("")}>
              {categories.find((c) => c.slug === selectedCategory)?.name}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {sort !== "new" && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSort("new")}>
              {sortOptions.find((s) => s.value === sort)?.label}
              <X className="w-3 h-3" />
            </Badge>
          )}
          <button onClick={clearAll} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
            Clear all
          </button>
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
        {/* Desktop sidebar */}
        {filtersOpen && (
          <aside className="hidden sm:block w-52 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        !selectedCategory ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedCategory === cat.slug ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Price Range</h3>
                <ul className="space-y-1">
                  {["Under $25", "$25 – $50", "$50 – $100", "Over $100"].map((r) => (
                    <li key={r}>
                      <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                        {r}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile category pills */}
        {filtersOpen && (
          <div className="sm:hidden w-full">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["", ...categories.map((c) => c.slug)].map((slug) => {
                const label = slug === "" ? "All" : categories.find((c) => c.slug === slug)?.name ?? slug;
                return (
                  <button
                    key={slug}
                    onClick={() => setSelectedCategory(slug)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 border transition-colors",
                      selectedCategory === slug ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </div>
  );
}
