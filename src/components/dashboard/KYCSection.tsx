"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function KYCSection() {
  const { data: session } = useAuth();
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [nidNumber, setNidNumber] = useState("");
  const [nidImageUrl, setNidImageUrl] = useState("");
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState("");

  useEffect(() => {
    fetch("/api/kyc")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setKycStatus(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidNumber || !nidImageUrl) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nidNumber, nidImageUrl, businessLicenseUrl })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Verification request submitted successfully!");
        setKycStatus(data.data);
      } else {
        toast.error(data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  // If they are already verified at the user level, don't show the form
  // Wait, useAuth might not immediately reflect the isVerifiedOwner flag if they just got verified in this session,
  // but it's safe to assume if kycStatus is approved, we show a success message.

  if (kycStatus?.status === "pending") {
    return (
      <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-yellow-500" />
          <h3 className="font-bold text-lg text-[var(--ink)]">Verification Pending</h3>
        </div>
        <p className="text-[var(--ink)]/70">
          Your KYC verification request is currently being reviewed by an administrator. We will notify you via email once it is processed.
        </p>
      </div>
    );
  }

  if (kycStatus?.status === "approved" || (session?.user as any)?.isVerifiedOwner) {
    return (
      <div className="bg-[var(--base)] border border-[var(--forest)] p-6 rounded-md mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-[var(--forest)]" />
          <h3 className="font-bold text-lg text-[var(--ink)]">You are Verified!</h3>
        </div>
        <p className="text-[var(--ink)]/70">
          Your account is fully verified. A verified badge now appears on your profile and spaces, giving your customers more confidence.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md mb-8">
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="w-6 h-6 text-[var(--ocean)]" />
        <h3 className="font-bold text-lg text-[var(--ink)]">Get Verified (KYC)</h3>
      </div>
      <p className="text-[var(--ink)]/70 mb-6">
        Submit your NID and optional business license to receive a Verified badge on your listings.
        {kycStatus?.status === "rejected" && (
          <span className="block mt-2 text-[var(--rust)]">
            <strong>Previous request rejected:</strong> {kycStatus.rejectionReason}
          </span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">NID Number *</label>
          <Input 
            required
            value={nidNumber}
            onChange={(e) => setNidNumber(e.target.value)}
            placeholder="e.g. 1234567890"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">NID Image URL *</label>
          <Input 
            required
            value={nidImageUrl}
            onChange={(e) => setNidImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Business License URL (Optional)</label>
          <Input 
            value={businessLicenseUrl}
            onChange={(e) => setBusinessLicenseUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <Button type="submit" disabled={isSubmitting || !nidNumber || !nidImageUrl}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Submit for Verification
        </Button>
      </form>
    </div>
  );
}
