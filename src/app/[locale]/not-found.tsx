"use client";

import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[var(--base)] text-center py-20">
      {/* Icon / Illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[var(--forest)]/10 blur-3xl rounded-full w-48 h-48 -z-10 animate-pulse left-1/2 -translate-x-1/2"></div>
        <Compass className="w-32 h-32 text-[var(--forest)] mx-auto drop-shadow-sm animate-[spin_10s_linear_infinite]" strokeWidth={1} />
        <div className="absolute bottom-0 right-0 bg-[var(--clay)] p-2 rounded-full border-4 border-[var(--base)]">
          <Search className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Typography */}
      <h1 className="font-display font-bold text-7xl md:text-9xl text-[var(--ink)] tracking-tighter mb-2">
        404
      </h1>
      <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--ink)] mb-4">
        Looks like you're lost in space.
      </h2>
      <p className="text-[var(--ink)]/60 max-w-md mx-auto mb-10 text-lg">
        The workspace you're looking for doesn't exist, has been moved, or is currently unavailable.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button asChild size="lg" className="w-full sm:w-auto font-bold gap-2">
          <Link href="/">
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-bold gap-2 border-[var(--line)] hover:bg-[var(--line)]">
          <Link href="/spaces">
            <Search className="w-5 h-5" />
            Explore Spaces
          </Link>
        </Button>
      </div>
    </div>
  );
}
