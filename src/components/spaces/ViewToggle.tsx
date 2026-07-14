"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Map, LayoutGrid } from "lucide-react";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentView = searchParams.get("view") || "grid";

  const toggleView = (view: "grid" | "map") => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex bg-[var(--line)]/30 rounded-md p-1 border border-[var(--line)]">
      <button
        onClick={() => toggleView("grid")}
        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold transition-colors ${
          currentView === "grid" ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--ink)]/60 hover:text-[var(--ink)]"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        Grid
      </button>
      <button
        onClick={() => toggleView("map")}
        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold transition-colors ${
          currentView === "map" ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--ink)]/60 hover:text-[var(--ink)]"
        }`}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  );
}
