import { SpaceCardSkeleton } from "@/components/spaces/SpaceCardSkeleton";

export default function LoadingSpaces() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-2">
          Explore Spaces
        </h1>
        <p className="text-[var(--ink)]/70">Find the perfect workspace for your needs.</p>
      </div>

      <div className="bg-white border border-[var(--line)] rounded-md p-4 mb-8 h-[250px] md:h-[180px] animate-pulse" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SpaceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
