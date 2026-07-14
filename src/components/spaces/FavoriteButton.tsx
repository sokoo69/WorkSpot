"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function FavoriteButton({ spaceId, initialFavorite = false }: { spaceId: string, initialFavorite?: boolean }) {
  const { data: session } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLiking, setIsLiking] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(`/login?redirect=/spaces/${spaceId}`);
      return;
    }

    try {
      setIsLiking(true);
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spaceId }),
      });
      if (res.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLiking}
      className={`p-3 border border-[var(--line)] rounded-md transition-colors flex items-center justify-center
        ${isFavorite ? 'bg-[var(--base)] hover:bg-[var(--line)]' : 'bg-white hover:bg-[var(--base)]'}`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={`w-6 h-6 transition-colors ${isFavorite ? "fill-[var(--clay)] text-[var(--clay)]" : "text-[var(--ink)]"}`} 
      />
    </button>
  );
}
