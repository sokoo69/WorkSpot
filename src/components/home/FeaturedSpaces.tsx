import { SpaceCard } from "@/components/spaces/SpaceCard";

export function FeaturedSpaces({ spaces }: { spaces: any[] }) {
  if (!spaces || spaces.length === 0) return null;

  return (
    <section className="py-20 bg-white border-b border-[var(--line)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-2">
              Featured Workspaces
            </h2>
            <p className="text-[var(--ink)]/70">Hand-picked spaces for your next project.</p>
          </div>
          <a href="/spaces" className="text-sm font-medium text-[var(--forest)] hover:underline hidden md:block">
            View all spaces &rarr;
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((space) => (
            <SpaceCard
              key={space._id}
              id={space._id}
              title={space.title}
              shortDescription={space.shortDescription}
              pricePerHour={space.pricePerHour}
              rating={space.rating}
              city={space.city}
              location={space.location}
              image={space.images?.[0] || ""}
            />
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <a href="/spaces" className="text-sm font-medium text-[var(--forest)] hover:underline">
            View all spaces &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
