"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusSquare, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

export default function ManageSpacesPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteSpaceId, setDeleteSpaceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMySpaces = async () => {
    try {
      const res = await fetch("/api/spaces/my");
      if (res.ok) {
        const data = await res.json();
        setSpaces(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySpaces();
  }, []);

  const handleDelete = async () => {
    if (!deleteSpaceId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/spaces/${deleteSpaceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSpaces(spaces.filter((s) => s.id !== deleteSpaceId));
        setDeleteSpaceId(null);
        toast.success("Space deleted successfully.");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to delete space");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete space");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-2">
            Manage Spaces
          </h1>
          <p className="text-[var(--ink)]/70">View and manage your workspace listings.</p>
        </div>
        <Link href="/spaces/add">
          <Button className="flex items-center gap-2">
            <PlusSquare className="w-4 h-4" /> Add New Space
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-[var(--line)]/50 rounded w-full"></div>
          <div className="h-12 bg-[var(--line)]/50 rounded w-full"></div>
          <div className="h-12 bg-[var(--line)]/50 rounded w-full"></div>
        </div>
      ) : spaces.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[var(--line)] rounded-md">
          <h3 className="font-bold text-xl text-[var(--ink)] mb-2">No spaces listed yet</h3>
          <p className="text-[var(--ink)]/70 mb-6">Start earning by listing your first workspace today.</p>
          <Link href="/spaces/add">
            <Button>List Your First Space</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[var(--line)] rounded-md overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-[var(--base)] text-[var(--ink)]/70 text-xs uppercase font-bold tracking-wider border-b border-[var(--line)]">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4 text-right">Price (BDT/hr)</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-sm text-[var(--ink)]">
              {spaces.map((space) => (
                <tr key={space.id} className="hover:bg-[var(--base)]/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{space.title}</td>
                  <td className="px-6 py-4">{space.category}</td>
                  <td className="px-6 py-4">{space.city}</td>
                  <td className="px-6 py-4 text-right font-mono">{space.pricePerHour}</td>
                  <td className="px-6 py-4 text-center font-mono">
                    {space.rating > 0 ? space.rating.toFixed(1) : "N/A"}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <Link href={`/spaces/${space.id}`}>
                      <Button variant="ghost" size="icon" title="View Public Page">
                        <Eye className="w-4 h-4 text-[var(--forest)]" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Delete Space"
                      onClick={() => setDeleteSpaceId(space.id)}
                    >
                      <Trash2 className="w-4 h-4 text-[var(--rust)]" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal 
        isOpen={!!deleteSpaceId} 
        onClose={() => setDeleteSpaceId(null)}
        title="Delete Workspace"
      >
        <p className="text-[var(--ink)]/80 mb-6">
          Are you sure you want to permanently delete this listing? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteSpaceId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>Delete Permanently</Button>
        </div>
      </Modal>
    </div>
  );
}
