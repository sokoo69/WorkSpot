"use client";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RecentlyViewed() {
  const { recentSpaces } = useRecentlyViewed();

  if (recentSpaces.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-[var(--line)]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-4">
              Recently Viewed
            </h2>
            <p className="text-[var(--ink)]/70 max-w-2xl text-lg">
              Pick up where you left off.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recentSpaces.map(space => (
            <Link key={space.id} href={`/spaces/${space.id}`} className="group block">
              <div className="relative h-32 md:h-40 w-full rounded-md overflow-hidden bg-[var(--base)] mb-3 border border-[var(--line)] group-hover:border-[var(--forest)] transition-colors">
                {space.image ? (
                  <Image 
                    src={space.image} 
                    alt={space.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--ink)]/50 text-xs">No Image</div>
                )}
              </div>
              <h3 className="font-bold text-sm text-[var(--ink)] line-clamp-1 group-hover:text-[var(--forest)] transition-colors">
                {space.title}
              </h3>
              <p className="font-mono text-xs text-[var(--ink)]/70">{space.pricePerHour} BDT/hr</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
