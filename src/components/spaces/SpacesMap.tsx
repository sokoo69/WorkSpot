"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Fix missing marker icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// A simple deterministic hash function to generate fake coordinates around Dhaka
function generateCoordinates(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Dhaka base coords
  const baseLat = 23.8103;
  const baseLng = 90.4125;
  
  // Add some random offset based on hash (-0.05 to +0.05)
  const latOffset = (hash % 100) / 2000;
  const lngOffset = ((hash >> 4) % 100) / 2000;
  
  return [baseLat + latOffset, baseLng + lngOffset] as [number, number];
}

export default function SpacesMap({ spaces }: { spaces: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[600px] bg-[var(--line)]/50 animate-pulse rounded-md" />;

  return (
    <div className="h-[600px] w-full rounded-md overflow-hidden border border-[var(--line)] relative z-0">
      <MapContainer 
        center={[23.8103, 90.4125]} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {spaces.map(space => {
          const position = generateCoordinates(space.id);
          return (
            <Marker key={space.id} position={position} icon={icon}>
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-[var(--ink)] mb-1">{space.title}</h3>
                  <p className="text-sm text-[var(--ink)]/80 mb-2">{space.pricePerHour} BDT/hr</p>
                  <p className="text-xs text-[var(--ink)]/60 mb-3">{space.city}</p>
                  <Link href={`/spaces/${space.id}`}>
                    <Button size="sm" className="w-full">View Details</Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
