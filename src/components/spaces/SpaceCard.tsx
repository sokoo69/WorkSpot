"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface SpaceCardProps {
  id: string;
  title: string;
  shortDescription: string;
  pricePerHour: number;
  rating: number;
  city: string;
  location: string;
  image: string;
  isFavorite?: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
  owner?: {
    name: string;
    isVerifiedOwner?: boolean;
  };
}

export function SpaceCard({
  id,
  title,
  shortDescription,
  pricePerHour,
  rating,
  city,
  location,
  image,
  isFavorite: initialFavorite = false,
  onFavoriteChange,
  owner,
}: SpaceCardProps) {
  const { data: session } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLiking, setIsLiking] = useState(false);

  const referenceCode = `#${city.substring(0, 3).toUpperCase()}-${id.substring(id.length - 4).toUpperCase()}`;

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    if (!session) {
      router.push(`/login?redirect=/spaces`);
      return;
    }

    const previousState = isFavorite;
    setIsFavorite(!isFavorite);
    if (onFavoriteChange) onFavoriteChange(!isFavorite);

    try {
      setIsLiking(true);
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spaceId: id }),
      });
      if (!res.ok) {
        throw new Error("Failed to toggle favorite");
      }
    } catch (error) {
      console.error(error);
      setIsFavorite(previousState);
      if (onFavoriteChange) onFavoriteChange(previousState);
      toast.error("Failed to update favorite status");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="flex flex-col border border-[var(--line)] rounded-md overflow-hidden bg-[var(--base)] hover:border-[var(--forest)] transition-colors h-full">
      <div className="relative h-48 w-full bg-[var(--line)]">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--ink)]/50">
            No Image
          </div>
        )}
        <button
          onClick={handleFavoriteToggle}
          disabled={isLiking}
          className="absolute top-3 right-3 p-2 bg-[var(--base)]/80 backdrop-blur-sm rounded-md hover:bg-[var(--base)] transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isFavorite ? "fill-[var(--clay)] text-[var(--clay)]" : "text-[var(--ink)]"}`} 
          />
        </button>
        <div className="absolute bottom-3 left-3 bg-[var(--base)]/90 backdrop-blur-sm px-2 py-1 rounded-sm text-xs font-mono font-medium text-[var(--ink)]">
          {referenceCode}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {owner && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--ink)] line-clamp-1">{owner.name}</span>
              {owner.isVerifiedOwner && (
                <span title="Verified Owner" className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-[var(--forest)] flex-shrink-0" />
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--ink)]/50">Host</span>
          </div>
        )}
        <h3 className="font-bold text-lg text-[var(--ink)] line-clamp-1 mb-1" title={title}>
          {title}
        </h3>
        <p className="text-sm text-[var(--ink)]/70 line-clamp-2 mb-4 flex-grow">
          {shortDescription}
        </p>
        
        <div className="flex items-center justify-between text-sm text-[var(--ink)] mb-4 pt-4 border-t border-[var(--line)]">
          <div className="flex items-center gap-1 font-mono font-medium">
            <span>{pricePerHour}</span>
            <span className="text-[var(--ink)]/60 text-xs">BDT/hr</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <Star className="w-4 h-4 fill-[var(--clay)] text-[var(--clay)]" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--ink)]/80">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[80px]" title={location}>{city}</span>
          </div>
        </div>

        <Link href={`/spaces/${id}`} className="w-full mt-auto">
          <Button className="w-full" variant="outline">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
