"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function Hero() {
  const t = useTranslations("Home");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/spaces?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/spaces");
    }
  };

  // Generate fewer grid cells for a subtle top-right decoration
  const gridCells = Array.from({ length: 12 });

  return (
    <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[var(--base)] border-b border-[var(--line)]">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png"
          alt="Coworking space background"
          fill
          priority
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--base)]/80 via-[var(--base)]/60 to-[var(--base)]" />
      </div>

      {/* Subtle Background Grid Decoration (Top Right) */}
      <div className="absolute top-0 right-0 z-0 opacity-40 pointer-events-none p-4 hidden sm:block">
        <div className="grid grid-cols-4 gap-2 w-64 h-48 opacity-30">
          {gridCells.map((_, i) => (
            <div 
              key={i} 
              className={`border border-[var(--line)] transition-all duration-1000 ease-out h-full ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full px-4 flex flex-col items-center mt-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tighter text-[var(--ink)] mb-6 drop-shadow-sm">
            {t("heroTitle")}
          </h1>
          <p className="font-mono text-lg md:text-xl text-[var(--ink)]/70 mb-10 max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-xl relative flex items-center justify-center mx-auto">
          <div className="absolute left-4 text-[var(--ink)]/50 z-10">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, area, or workspace name..."
            className="w-full h-14 pl-12 pr-32 rounded-md border border-[var(--line)] bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--forest)] focus:border-transparent text-lg shadow-sm"
          />
          <Button 
            type="submit" 
            size="lg" 
            className="absolute right-1 top-1 bottom-1 h-12 z-10"
          >
            Explore Spaces
          </Button>
        </form>
      </div>
    </section>
  );
}
