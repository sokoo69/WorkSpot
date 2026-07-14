"use client";

import { useState, useEffect } from "react";

export interface RecentSpace {
  id: string;
  title: string;
  image: string;
  pricePerHour: number;
}

export function useRecentlyViewed() {
  const [recentSpaces, setRecentSpaces] = useState<RecentSpace[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) setRecentSpaces(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addRecentSpace = (space: RecentSpace) => {
    try {
      setRecentSpaces(prev => {
        const filtered = prev.filter(s => s.id !== space.id);
        const next = [space, ...filtered].slice(0, 5); // Keep last 5
        localStorage.setItem("recentlyViewed", JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  };

  return { recentSpaces, addRecentSpace };
}
