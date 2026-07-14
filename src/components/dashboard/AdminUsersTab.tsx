"use client";

import { useEffect, useState } from "react";
import { Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function AdminUsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const result = await res.json();
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-[var(--ink)]/50">Loading users...</div>;
  }

  return (
    <div className="py-6">
      <div className="bg-[var(--base)] border border-[var(--line)] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--line)]/50 text-[var(--ink)]/70 text-xs uppercase font-bold tracking-wider border-b border-[var(--line)]">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-sm text-[var(--ink)]">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[var(--line)]/20">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-[var(--forest)] text-[var(--base)]' : 'bg-[var(--line)] text-[var(--ink)]'}`}>
                      {user.role}
                    </span>
                    {user.isVerifiedOwner && (
                      <span className="ml-2 px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-[var(--forest)]/10 text-[var(--forest)]">
                        KYC
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-[var(--ink)]/50 hover:text-[var(--rust)] transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-[var(--ink)]/50">No users found</div>
        )}
      </div>
    </div>
  );
}
