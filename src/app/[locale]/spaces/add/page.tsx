"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const spaceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  shortDescription: z.string().max(150, "Short description cannot exceed 150 characters"),
  fullDescription: z.string().min(20, "Please provide a detailed description"),
  category: z.enum(["Private Room", "Shared Desk", "Meeting Room", "Conference Hall"]),
  city: z.string().min(2, "City is required"),
  location: z.string().min(5, "Detailed location is required"),
  pricePerHour: z.coerce.number().min(1, "Price must be greater than 0"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  image: z.string().optional(),
});

const DEFAULT_IMAGES: Record<string, string> = {
  "Private Room": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  "Shared Desk": "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80",
  "Meeting Room": "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80",
  "Conference Hall": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
};

const AVAILABLE_AMENITIES = ["WiFi", "AC", "Parking", "Coffee", "Whiteboard", "Projector", "Printer", "Lockers"];

export default function AddSpacePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      fullDescription: "",
      category: "Shared Desk",
      city: "",
      location: "",
      pricePerHour: 0,
      capacity: 1,
      image: "",
    }
  });

  const category = watch("category");

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const onSubmit = async (data: z.infer<typeof spaceSchema>) => {
    setIsLoading(true);
    setError("");

    // Fallback image based on category if empty
    const finalImage = data.image?.trim() ? data.image : DEFAULT_IMAGES[data.category as keyof typeof DEFAULT_IMAGES];

    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: [finalImage],
          amenities: selectedAmenities,
        }),
      });

      if (res.ok) {
        router.push("/spaces/manage");
        router.refresh();
      } else {
        const resData = await res.json();
        setError(resData.message || "Failed to add space");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-2">List a New Space</h1>
      <p className="text-[var(--ink)]/70 mb-8">Fill in the details to publish your workspace on WorkSpot.</p>

      {error && (
        <div className="mb-6 p-4 bg-[var(--rust)]/10 border border-[var(--rust)]/30 text-[var(--rust)] rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 md:p-8 border border-[var(--line)] rounded-md shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Title *</label>
            <Input {...register("title")} placeholder="e.g. Modern Minimalist Desk in Gulshan" />
            {errors.title && <p className="text-[var(--rust)] text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Short Description *</label>
            <Input {...register("shortDescription")} placeholder="Briefly describe the space (max 150 chars)" />
            {errors.shortDescription && <p className="text-[var(--rust)] text-xs mt-1">{errors.shortDescription.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Full Description *</label>
            <textarea 
              {...register("fullDescription")} 
              className="w-full h-32 rounded-md border border-[var(--line)] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)] resize-none"
              placeholder="Detailed description of the environment, rules, and vibe."
            />
            {errors.fullDescription && <p className="text-[var(--rust)] text-xs mt-1">{errors.fullDescription.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Category *</label>
            <select 
              {...register("category")}
              className="w-full h-10 rounded-md border border-[var(--line)] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]"
            >
              <option value="Private Room">Private Room</option>
              <option value="Shared Desk">Shared Desk</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Conference Hall">Conference Hall</option>
            </select>
            {errors.category && <p className="text-[var(--rust)] text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">City *</label>
            <Input {...register("city")} placeholder="e.g. Dhaka" />
            {errors.city && <p className="text-[var(--rust)] text-xs mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Location *</label>
            <Input {...register("location")} placeholder="e.g. Banani, Road 11" />
            {errors.location && <p className="text-[var(--rust)] text-xs mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Price Per Hour (BDT) *</label>
            <Input {...register("pricePerHour")} type="number" placeholder="500" />
            {errors.pricePerHour && <p className="text-[var(--rust)] text-xs mt-1">{errors.pricePerHour.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Capacity (Seats) *</label>
            <Input {...register("capacity")} type="number" placeholder="4" />
            {errors.capacity && <p className="text-[var(--rust)] text-xs mt-1">{errors.capacity.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--ink)] mb-2 uppercase tracking-wider">Amenities</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedAmenities.includes(amenity) ? 'bg-[var(--forest)] text-white border-[var(--forest)]' : 'bg-transparent text-[var(--ink)] border-[var(--line)] hover:border-[var(--forest)]'}`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Image URL (Optional)</label>
            <Input {...register("image")} placeholder="https://images.unsplash.com/..." />
            <p className="text-xs text-[var(--ink)]/50 mt-1">Leave blank to use a default image based on category.</p>
            {errors.image && <p className="text-[var(--rust)] text-xs mt-1">{errors.image.message}</p>}
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--line)] flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Publishing..." : "Publish Space"}
          </Button>
        </div>
      </form>
    </div>
  );
}
