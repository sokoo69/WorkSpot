"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { pusherClient } from "@/lib/pusherClient";

export function AvailabilityCalendar({ spaceId }: { spaceId: string }) {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings/check?spaceId=${spaceId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // We assume API returns unique dates or full booking objects
          // We need to map string dates to Date objects
          const dates = data.data.map((b: any) => new Date(b.date));
          setBookedDates(dates);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    // Pusher real-time subscription
    const channelName = `space-${spaceId}`;
    const channel = pusherClient.subscribe(channelName);
    
    channel.bind("slot-booked", (data: { dates: string[] }) => {
      if (data && data.dates) {
        const newDates = data.dates.map((d: string) => new Date(d));
        setBookedDates(prev => [...prev, ...newDates]);
      }
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [spaceId]);

  return (
    <div className="bg-[var(--base)] rounded-md p-4 border border-[var(--line)]">
      <h3 className="font-bold text-[var(--ink)] text-sm mb-4 uppercase tracking-wider">Availability</h3>
      {isLoading ? (
        <div className="animate-pulse h-64 bg-[var(--line)]/50 rounded-md"></div>
      ) : (
        <div className="flex justify-center">
          <style>{`
            .rdp {
              --rdp-cell-size: 32px;
              --rdp-accent-color: var(--rust);
              --rdp-background-color: var(--line);
              margin: 0;
            }
            .rdp-day_selected {
              background-color: var(--rust) !important;
              color: white;
            }
          `}</style>
          <DayPicker
            mode="multiple"
            selected={bookedDates}
            disabled={[{ before: new Date() }]}
            modifiers={{ booked: bookedDates }}
            modifiersStyles={{
              booked: { 
                backgroundColor: 'var(--rust)', 
                color: 'white',
                borderRadius: '4px'
              }
            }}
          />
        </div>
      )}
      <div className="flex items-center gap-2 mt-4 text-xs text-[var(--ink)]/60 justify-center">
        <div className="w-3 h-3 bg-[var(--rust)] rounded-sm"></div>
        <span>Has Bookings</span>
      </div>
    </div>
  );
}
