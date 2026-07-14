"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export function RecentViewTracker({ 
  id, title, image, pricePerHour 
}: { 
  id: string, title: string, image: string, pricePerHour: number 
}) {
  const { addRecentSpace } = useRecentlyViewed();

  useEffect(() => {
    addRecentSpace({ id, title, image, pricePerHour });
  }, [id, title, image, pricePerHour]);

  return null;
}
