"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SpaceCard } from "@/components/spaces/SpaceCard";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch favorites", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-2">
        Saved Spaces
      </h1>
      <p className="text-[var(--ink)]/70 mb-8">Workspaces you've favorited for later.</p>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-[var(--line)]/50 rounded-md w-full"></div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[var(--line)] rounded-md">
          <Heart className="w-12 h-12 text-[var(--line)] mx-auto mb-4" />
          <h3 className="font-bold text-xl text-[var(--ink)] mb-2">No favorites yet</h3>
          <p className="text-[var(--ink)]/70 mb-6">Click the heart icon on a space to save it here.</p>
          <Link href="/spaces">
            <Button>Explore Spaces</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((space) => (
            <SpaceCard
              key={space.id}
              id={space.id}
              title={space.title}
              shortDescription={space.shortDescription}
              pricePerHour={space.pricePerHour}
              rating={space.rating}
              city={space.city}
              location={space.location}
              image={space.images?.[0] || ""}
              isFavorite={space.isFavorite}
              onFavoriteChange={(isFav) => {
                if (!isFav) {
                  setFavorites(prev => prev.filter(s => s.id !== space.id));
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
