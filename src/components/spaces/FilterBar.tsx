"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minCapacity, setMinCapacity] = useState(searchParams.get("minCapacity") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt_desc");

  const [showFilters, setShowFilters] = useState(false);

  // Apply filters to URL
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minCapacity) params.set("minCapacity", minCapacity);
    if (sort) params.set("sort", sort);
    params.set("page", "1"); // Reset to page 1 on new filter

    router.push(`/spaces?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinCapacity("");
    setSort("createdAt_desc");
    router.push("/spaces");
  };

  // Sync state with URL if user navigates back/forward
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setCity(searchParams.get("city") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setMinCapacity(searchParams.get("minCapacity") || "");
    setSort(searchParams.get("sort") || "createdAt_desc");
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length >= 2) {
        try {
          const res = await fetch(`/api/spaces/search?q=${encodeURIComponent(search)}`);
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Search failed", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-white border border-[var(--line)] rounded-md p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow" ref={searchContainerRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search spaces by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            className="pl-10 relative z-10"
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--line)] rounded-md shadow-lg z-50 overflow-hidden">
              {suggestions.map((s) => (
                <Link 
                  key={s.id} 
                  href={`/spaces/${s.id}`}
                  className="block px-4 py-3 hover:bg-[var(--base)] border-b border-[var(--line)] last:border-0"
                >
                  <div className="font-bold text-[var(--ink)] text-sm">{s.title}</div>
                  <div className="text-[var(--ink)]/60 text-xs">{s.city}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button onClick={applyFilters}>Search</Button>
        </div>
      </div>

      <div className={`${showFilters ? "block" : "hidden"} md:block border-t border-[var(--line)] pt-4 mt-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-md border border-[var(--line)] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
            >
              <option value="">All Categories</option>
              <option value="Private Room">Private Room</option>
              <option value="Shared Desk">Shared Desk</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Conference Hall">Conference Hall</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-10 rounded-md border border-[var(--line)] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
            >
              <option value="">All Cities</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Sylhet">Sylhet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Price (BDT/hr)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10 px-2"
              />
              <span className="text-[var(--ink)]/50">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10 px-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Min Capacity</label>
            <Input
              type="number"
              placeholder="e.g. 10"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full h-10 rounded-md border border-[var(--line)] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-3">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" /> Clear Filters
          </Button>
          <Button size="sm" onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}
