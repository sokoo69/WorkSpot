"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function Newsletter() {
  return (
    <section className="py-24 bg-[var(--base)] border-b border-[var(--line)] relative overflow-hidden">
      {/* Decorative bg lines */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 border border-[var(--line)] rounded-full opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 border border-[var(--line)] rounded-full opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-4">
            Get exclusive workspace offers
          </h2>
          <p className="text-[var(--ink)]/70 mb-8">
            Subscribe to our newsletter to receive the latest updates on new spaces and special discounts in your city.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-white h-12"
              required
            />
            <Button type="submit" size="lg" className="h-12 w-full sm:w-auto px-8">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-[var(--ink)]/50 mt-4">
            We respect your privacy. No spam, ever.
          </p>
        </div>
      </div>
    </section>
  );
}
