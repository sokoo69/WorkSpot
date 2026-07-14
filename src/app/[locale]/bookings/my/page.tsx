"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, XCircle, Phone, Mail, User, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { InvoiceDownload } from "@/components/bookings/InvoiceDownload";
import { ChatModal } from "@/components/chat/ChatModal";
import { useTranslations } from "next-intl";

export default function MyBookingsPage() {
  const t = useTranslations("Bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [chatBooking, setChatBooking] = useState<{ id: string; title: string } | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async () => {
    if (!cancelBookingId) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancelBookingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookings(bookings.map(b => 
          b.id === cancelBookingId ? { ...b, status: "cancelled" } : b
        ));
        setCancelBookingId(null);
        toast.success("Booking cancelled successfully.");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-2">
          {t('title')}
        </h1>
        <p className="text-[var(--ink)]/70">{t('subtitle')}</p>
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-[var(--line)]/50 rounded-md w-full"></div>
          <div className="h-32 bg-[var(--line)]/50 rounded-md w-full"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[var(--line)] rounded-md">
          <Calendar className="w-12 h-12 text-[var(--line)] mx-auto mb-4" />
          <h3 className="font-bold text-xl text-[var(--ink)] mb-2">{t('noBookings')}</h3>
          <p className="text-[var(--ink)]/70 mb-6"></p>
          <Button asChild>
            <Link href="/spaces">
              {t('explore')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className={`bg-white rounded-md overflow-hidden border ${
                booking.status === "cancelled" ? "border-[var(--rust)]/30 opacity-75" : "border-[var(--line)]"
              } transition-colors hover:border-[var(--forest)] flex flex-col md:flex-row gap-6 p-6`}
            >
              <div className="relative w-full md:w-48 h-32 bg-[var(--base)] rounded-md overflow-hidden shrink-0">
                {booking.space?.image ? (
                  <Image 
                    src={booking.space.image} 
                    alt={booking.space.title} 
                    fill 
                    className="object-cover" 
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--ink)]/50 text-sm">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Link href={`/spaces/${booking.spaceId}`} className="hover:underline">
                      <h3 className="font-bold text-xl text-[var(--ink)] line-clamp-1">
                        {booking.space?.title || "Unknown Space"}
                      </h3>
                    </Link>
                    <div className="flex gap-2">
                      {booking.paymentStatus === "paid" && (
                        <Badge variant="outline" className="bg-[var(--forest)]/10 text-[var(--forest)] border-[var(--forest)]">
                          Paid
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-[var(--ink)]/80 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--forest)]" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--forest)]" />
                      <span>{booking.startTime} - {booking.endTime} ({booking.hours} hrs)</span>
                    </div>
                  </div>

                  {booking.space?.owner && (
                    <div className="mt-4 pt-4 border-t border-[var(--line)] border-dashed">
                      <p className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-2">Space Owner</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-[var(--ink)]/80">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[var(--ink)]/50" />
                          <span className="font-medium">{booking.space.owner.name}</span>
                          {booking.space.owner.isVerifiedOwner && (
                            <span title="Verified Owner" className="flex items-center">
                              <ShieldCheck className="w-4 h-4 text-[var(--forest)]" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[var(--ink)]/50" />
                          <span>{booking.space.owner.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[var(--ink)]/50" />
                          <span>{booking.space.owner.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 p-4 bg-[var(--base)] rounded-md border border-[var(--line)]">
                  <span className="font-bold text-[var(--ink)]">{t('total', { amount: booking.totalPrice.toFixed(2) })}</span>
                  <Badge 
                    variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"}
                    className={booking.status === "confirmed" ? "bg-[var(--forest)]/10 text-[var(--forest)] border-[var(--forest)]/20" : ""}
                  >
                    {booking.status === "confirmed" ? t('statusConfirmed') : booking.status === "cancelled" ? t('statusCancelled') : t('statusPending')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--line)]">
                  <div className="flex items-center gap-4">
                    {booking.paymentStatus === "paid" && (
                      <InvoiceDownload booking={booking} space={booking.space} />
                    )}
                    {booking.paymentStatus === "paid" && (
                      <div className="hidden sm:block">
                        <QRCodeSVG value={booking.id} size={48} level="M" />
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setChatBooking({ id: booking._id || booking.id, title: booking.space?.title })}
                        className="flex items-center gap-1 text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)] hover:text-[var(--ink)]"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message Owner
                      </Button>
                    )}
                    {booking.status !== "cancelled" && new Date(`${booking.date}T${booking.startTime}`) > new Date() && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[var(--rust)] hover:text-[var(--rust)]/80 hover:bg-[var(--rust)]/10 border-[var(--rust)]/30"
                      onClick={() => setCancelBookingId(booking.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal 
        isOpen={!!cancelBookingId} 
        onClose={() => setCancelBookingId(null)}
        title="Cancel Booking"
      >
        <p className="text-[var(--ink)]/80 mb-6">
          Are you sure you want to cancel this reservation? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCancelBookingId(null)}>Keep Booking</Button>
          <Button variant="destructive" onClick={handleCancel} isLoading={isCancelling}>Yes, Cancel</Button>
        </div>
      </Modal>

      {/* Chat Modal */}
      {chatBooking && (
        <ChatModal 
          isOpen={!!chatBooking} 
          onClose={() => setChatBooking(null)} 
          bookingId={chatBooking.id}
          spaceTitle={chatBooking.title}
        />
      )}
    </div>
  );
}
