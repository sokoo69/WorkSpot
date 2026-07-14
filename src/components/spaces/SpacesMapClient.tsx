"use client";

import dynamic from "next/dynamic";

const SpacesMap = dynamic(() => import("@/components/spaces/SpacesMap"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-[var(--line)]/50 animate-pulse rounded-md" />
});

export function SpacesMapClient({ spaces }: { spaces: any[] }) {
  return <SpacesMap spaces={spaces} />;
}
