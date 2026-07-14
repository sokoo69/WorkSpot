"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function ReviewForm({ spaceId }: { spaceId: string }) {
  const { data: session } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="mt-8 p-4 bg-[var(--base)] border border-[var(--line)] rounded-md text-center">
        <p className="text-[var(--ink)]/70 mb-2">Log in to leave a review</p>
        <Button variant="outline" onClick={() => router.push(`/login?redirect=/spaces/${spaceId}`)}>
          Log In
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/spaces/${spaceId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        setComment("");
        setRating(5);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to submit review");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 p-6 bg-white border border-[var(--line)] rounded-md shadow-sm">
      <h3 className="font-bold text-lg text-[var(--ink)] mb-4">Write a Review</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-[var(--rust)]/10 text-[var(--rust)] text-sm rounded border border-[var(--rust)]/30">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-bold text-[var(--ink)]">Rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 focus-visible:outline-none"
            >
              <Star 
                className={`w-6 h-6 transition-colors ${
                  star <= rating ? "fill-[var(--clay)] text-[var(--clay)]" : "text-[var(--line)]"
                }`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="w-full h-24 p-3 border border-[var(--line)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--forest)] resize-none"
        ></textarea>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Post Review"}
      </Button>
    </form>
  );
}
