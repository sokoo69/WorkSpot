"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";

interface BookingWidgetProps {
  spaceId: string;
  pricePerHour: number;
}

export function BookingWidget({ spaceId, pricePerHour }: BookingWidgetProps) {
  const t = useTranslations("BookingWidget");
  const { data: session } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<{startTime: string, endTime: string}[]>([]);

  useEffect(() => {
    if (!date) return;
    fetch(`/api/bookings/check?spaceId=${spaceId}&date=${date}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setBookedSlots(res.data);
        }
      })
      .catch(console.error);
  }, [date, spaceId]);

  // Calculate hours
  let hours = 0;
  let totalPrice = 0;

  if (startTime && endTime) {
    const startParts = startTime.split(":");
    const endParts = endTime.split(":");
    const startMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    
    if (endMins > startMins) {
      hours = (endMins - startMins) / 60;
      totalPrice = hours * pricePerHour;
    }
  }
  let hasConflict = false;
  if (hours > 0) {
    const s1 = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
    const e1 = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
    
    for (const slot of bookedSlots) {
      const s2 = parseInt(slot.startTime.split(":")[0]) * 60 + parseInt(slot.startTime.split(":")[1]);
      const e2 = parseInt(slot.endTime.split(":")[0]) * 60 + parseInt(slot.endTime.split(":")[1]);
      if (Math.max(s1, s2) < Math.min(e1, e2)) {
        hasConflict = true;
        break;
      }
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(`/login?redirect=/spaces/${spaceId}`);
      return;
    }

    if (!date || !startTime || !endTime || hours <= 0 || hasConflict) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId,
          date,
          startTime,
          endTime,
          hours,
          totalPrice: repeatWeekly ? totalPrice * 4 : totalPrice,
          repeatWeekly
        })
      });

      const data = await res.json();

      if (res.ok) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          setSuccess(true);
          toast.success("Booking confirmed!");
          setTimeout(() => {
            router.push("/bookings/my");
          }, 2000);
        }
      } else {
        toast.error(data.message || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Booking failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[var(--forest)]/10 border border-[var(--forest)] p-6 rounded-md text-center">
        <h3 className="font-bold text-[var(--forest)] text-xl mb-2">Reservation Confirmed</h3>
        <p className="text-[var(--ink)]/80 mb-4">
          Booked for {date}, {startTime} - {endTime} <br />
          Total: <span className="font-mono font-bold">{totalPrice.toFixed(2)} BDT</span>
        </p>
        <Button onClick={() => router.push("/bookings/my")} className="w-full">
          View My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--line)] rounded-md p-6 shadow-sm">
      <div className="mb-6 pb-6 border-b border-[var(--line)]">
        <div className="flex items-end gap-2">
          <span className="font-mono font-bold text-2xl text-[var(--ink)]">{pricePerHour}</span>
          <span className="text-[var(--ink)]/60 text-sm mb-1">BDT / hour</span>
        </div>
      </div>

      <form onSubmit={handleBooking} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">{t("date")}</label>
          <Input 
            type="date" 
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">{t("startTime")}</label>
            <Input 
              type="time" 
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">{t("endTime")}</label>
            <Input 
              type="time" 
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input 
            type="checkbox" 
            id="repeatWeekly" 
            checked={repeatWeekly}
            onChange={(e) => setRepeatWeekly(e.target.checked)}
            className="rounded border-[var(--line)] text-[var(--forest)] focus:ring-[var(--forest)] focus-visible:ring-2 outline-none"
          />
          <label htmlFor="repeatWeekly" className="text-sm text-[var(--ink)]/80">
            {t("repeatWeekly")}
          </label>
        </div>

        {hours > 0 ? (
          <div className="bg-[var(--base)] p-4 rounded-md mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--ink)]/70">{pricePerHour} BDT x {hours.toFixed(1)} hrs</span>
              <span className="font-mono font-medium">{totalPrice.toFixed(2)} BDT</span>
            </div>
            <div className="flex justify-between font-bold border-t border-[var(--line)] pt-2 mt-2">
              <span>Total {repeatWeekly && "(4 weeks)"}</span>
              <span className="font-mono">{(repeatWeekly ? totalPrice * 4 : totalPrice).toFixed(2)} BDT</span>
            </div>
          </div>
        ) : (
          startTime && endTime && (
            <p className="text-[var(--rust)] text-sm mt-2">{t("invalidTime")}</p>
          )
        )}
        
        {hasConflict && (
          <div className="bg-[var(--rust)]/10 text-[var(--rust)] p-3 rounded-md text-sm border border-[var(--rust)]/20 mt-2">
            {t("conflict")}
          </div>
        )}

        {bookedSlots.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--line)]">
            <p className="text-xs font-bold text-[var(--ink)] mb-2 uppercase tracking-wider">Already Booked Times Today:</p>
            <div className="flex flex-wrap gap-2">
              {bookedSlots.map((slot, i) => (
                <span key={i} className="text-xs bg-[var(--line)]/50 px-2 py-1 rounded text-[var(--ink)]/70">
                  {slot.startTime} - {slot.endTime}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full mt-4" 
          size="lg"
          disabled={hours <= 0 || hasConflict}
          isLoading={isSubmitting}
        >
          {isSubmitting ? t("processing") : t("reserve", { hours: hours > 0 ? hours.toFixed(1) : "X" })}
        </Button>
        {!session && (
          <p className="text-center text-xs text-[var(--ink)]/60 mt-2">
            {t("loginRedirect")}
          </p>
        )}
      </form>
    </div>
  );
}
