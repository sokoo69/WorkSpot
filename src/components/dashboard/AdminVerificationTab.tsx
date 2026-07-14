"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export function AdminVerificationTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/verify-kyc/list");
      if (res.ok) {
        const result = await res.json();
        setRequests(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdate = async (id: string, status: "approved" | "rejected", reason?: string) => {
    try {
      const res = await fetch(`/api/admin/verify-kyc`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, status, rejectionReason: reason })
      });
      if (res.ok) {
        setRequests(requests.map(r => r._id === id ? { ...r, status, rejectionReason: reason } : r));
        toast.success(`Request ${status} successfully`);
        if (status === "rejected") {
          setRejectModalOpen(false);
          setRejectionReason("");
        }
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update KYC status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedRequestId(id);
    setRejectModalOpen(true);
  };

  if (isLoading) {
    return <div className="py-12 text-center text-[var(--ink)]/50">Loading verification requests...</div>;
  }

  return (
    <div className="py-6">
      <div className="bg-[var(--base)] border border-[var(--line)] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--line)]/50 text-[var(--ink)]/70 text-xs uppercase font-bold tracking-wider border-b border-[var(--line)]">
              <tr>
                <th className="px-6 py-4">User / Date</th>
                <th className="px-6 py-4">NID Details</th>
                <th className="px-6 py-4">Business License</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-sm text-[var(--ink)]">
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--ink)]/50">
                    No verification requests found.
                  </td>
                </tr>
              )}
              {requests.map(req => (
                <tr key={req._id} className="hover:bg-[var(--line)]/20">
                  <td className="px-6 py-4">
                    <div className="font-medium">{req.userId}</div>
                    <div className="text-xs text-[var(--ink)]/60 mt-1">{new Date(req.submittedAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono">{req.nidNumber}</div>
                    <a href={req.nidImageUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--ocean)] hover:underline mt-1 block">
                      View Document
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    {req.businessLicenseUrl ? (
                      <a href={req.businessLicenseUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--ocean)] hover:underline">
                        View License
                      </a>
                    ) : (
                      <span className="text-[var(--ink)]/50 italic text-xs">None provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${
                      req.status === 'approved' ? 'bg-[var(--forest)]/10 text-[var(--forest)]' : 
                      req.status === 'rejected' ? 'bg-[var(--rust)]/10 text-[var(--rust)]' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleUpdate(req._id, "approved")}
                          className="bg-[var(--forest)] hover:bg-[var(--forest)]/90 h-8"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectModal(req._id)}
                          className="h-8"
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Verification Request">
        <div className="space-y-4">
          <p className="text-sm text-[var(--ink)]/80">
            Please provide a reason for rejecting this KYC request. This will be sent to the user.
          </p>
          <Input 
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. NID image is blurry"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              disabled={!rejectionReason.trim()}
              onClick={() => selectedRequestId && handleUpdate(selectedRequestId, "rejected", rejectionReason)}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
