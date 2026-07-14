"use client";

import CountUp from "react-countup";

export function Stats({ stats }: { stats: { spaces: number; cities: number; owners: number } }) {
  return (
    <section className="py-16 bg-[var(--forest)] text-[var(--base)] border-b border-[var(--ink)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--base)]/20">
          <div className="py-4 md:py-0">
            <div className="font-display font-bold text-5xl mb-2">
              <CountUp end={stats.spaces} enableScrollSpy scrollSpyOnce />+
            </div>
            <div className="text-[var(--base)]/80 text-sm tracking-wider uppercase font-medium">Workspaces</div>
          </div>
          <div className="py-4 md:py-0">
            <div className="font-display font-bold text-5xl mb-2">
              <CountUp end={stats.cities} enableScrollSpy scrollSpyOnce />
            </div>
            <div className="text-[var(--base)]/80 text-sm tracking-wider uppercase font-medium">Cities</div>
          </div>
          <div className="py-4 md:py-0">
            <div className="font-display font-bold text-5xl mb-2">
              <CountUp end={stats.owners} enableScrollSpy scrollSpyOnce />+
            </div>
            <div className="text-[var(--base)]/80 text-sm tracking-wider uppercase font-medium">Space Owners</div>
          </div>
        </div>
      </div>
    </section>
  );
}
