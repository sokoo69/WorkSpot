"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export function AdminSpacesTab() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpaces = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/spaces");
      if (res.ok) {
        const result = await res.json();
        setSpaces(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch spaces", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this space? All associated bookings might be affected.")) return;
    
    try {
      const res = await fetch(`/api/admin/spaces?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSpaces(spaces.filter(s => s._id !== id));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete space");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-[var(--ink)]/50">Loading spaces...</div>;
  }

  return (
    <div className="py-6">
      <div className="bg-[var(--base)] border border-[var(--line)] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--line)]/50 text-[var(--ink)]/70 text-xs uppercase font-bold tracking-wider border-b border-[var(--line)]">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Price/Hr</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-sm text-[var(--ink)]">
              {spaces.map(space => (
                <tr key={space._id} className="hover:bg-[var(--line)]/20">
                  <td className="px-6 py-4 font-medium">{space.title}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{space.category}</Badge>
                  </td>
                  <td className="px-6 py-4">{space.city}</td>
                  <td className="px-6 py-4 font-mono">{space.pricePerHour} BDT</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <Link href={`/spaces/${space._id}`} target="_blank" className="text-[var(--forest)] hover:text-[var(--forest)]/80 p-2 rounded-md hover:bg-[var(--forest)]/10 transition-colors" title="View Space">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(space._id)} className="text-[var(--rust)] hover:text-[var(--rust)]/80 p-2 rounded-md hover:bg-[var(--rust)]/10 transition-colors" title="Delete Space">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {spaces.length === 0 && (
          <div className="p-8 text-center text-[var(--ink)]/50">No spaces found</div>
        )}
      </div>
    </div>
  );
}
