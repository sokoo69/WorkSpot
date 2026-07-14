"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Phone, Mail, User } from "lucide-react";

export function BookingRequestsSection() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/bookings/received");
        if (res.ok) {
          const result = await res.json();
          setRequests(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch booking requests", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (isLoading) {
    return <div className="py-12 text-center text-[var(--ink)]/50 animate-pulse">Loading booking requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="py-12 text-center text-[var(--ink)]/50 border border-[var(--line)] border-dashed rounded-md mt-6">
        No one has booked your spaces yet.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="font-bold text-xl text-[var(--ink)] mb-4 border-b border-[var(--line)] pb-2">Booking Requests</h2>
      <p className="text-sm text-[var(--ink)]/70 mb-6">Bookings made by other users on the spaces you own.</p>
      
      <div className="bg-[var(--base)] border border-[var(--line)] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--line)]/50 text-[var(--ink)]/70 text-xs uppercase font-bold tracking-wider border-b border-[var(--line)]">
              <tr>
                <th className="px-6 py-4">Space & Time</th>
                <th className="px-6 py-4">Booker Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-sm text-[var(--ink)]">
              {requests.map(booking => (
                <tr key={booking._id} className="hover:bg-[var(--line)]/20">
                  <td className="px-6 py-4">
                    <div className="font-bold">{booking.spaceTitle}</div>
                    <div className="text-xs text-[var(--ink)]/70 mt-1">{booking.date} | {booking.startTime} - {booking.endTime}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <User className="w-3 h-3 text-[var(--ink)]/50" /> {booking.booker.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--ink)]/70 mb-1">
                      <Mail className="w-3 h-3 text-[var(--ink)]/50" /> {booking.booker.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--ink)]/70">
                      <Phone className="w-3 h-3 text-[var(--ink)]/50" /> {booking.booker.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={booking.status === "cancelled" ? "destructive" : "default"}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold">
                    {booking.totalPrice} BDT
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
