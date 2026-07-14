"use client";

import { useState } from "react";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ProfileSection({ session }: { session: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    phoneNumber: session?.user?.phoneNumber || "",
    image: session?.user?.image || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--base)] border border-[var(--line)] p-6 rounded-md mb-8">
      <div className="flex items-center gap-2 mb-6 border-b border-[var(--line)] pb-4">
        <User className="w-5 h-5 text-[var(--forest)]" />
        <h2 className="font-bold text-xl text-[var(--ink)]">Profile Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">
            Email Address
          </label>
          <Input 
            type="email" 
            value={session?.user?.email || ""} 
            disabled 
            className="w-full bg-[var(--line)]/30 cursor-not-allowed opacity-70"
            title="Email cannot be changed"
          />
          <p className="text-xs text-[var(--ink)]/50 mt-1">Your email address cannot be changed.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">
            Full Name
          </label>
          <Input 
            type="text" 
            name="name"
            value={formData.name} 
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">
            Phone Number
          </label>
          <Input 
            type="tel" 
            name="phoneNumber"
            value={formData.phoneNumber} 
            onChange={handleChange}
            placeholder="+8801700000000"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">
            Profile Photo URL
          </label>
          <Input 
            type="url" 
            name="image"
            value={formData.image} 
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="w-full"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="mt-4">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
