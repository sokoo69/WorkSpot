"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function InvoiceDownload({ booking, space }: { booking: any; space: any }) {
  
  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(34, 139, 34); // forest green equivalent
      doc.text("WorkSpot Invoice", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice Number: INV-${booking._id || booking.id}`, 14, 30);
      doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 35);
      
      // Booking Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Booking Details", 14, 50);
      
      const tableData = [
        ["Space", space?.title || "N/A"],
        ["Location", `${space?.location || ""}, ${space?.city || ""}`],
        ["Date", booking.date],
        ["Time", `${booking.startTime} - ${booking.endTime}`],
        ["Duration", `${booking.hours} hours`],
        ["Status", booking.paymentStatus === "paid" ? "PAID" : "PENDING"],
      ];

      autoTable(doc, {
        startY: 55,
        head: [["Description", "Details"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [34, 139, 34] },
      });

      // Total
      const finalY = (doc as any).lastAutoTable?.finalY || 100;
      doc.setFontSize(14);
      doc.text(`Total Paid: ${booking.totalPrice} BDT`, 14, finalY + 15);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Thank you for using WorkSpot!", 14, 280);
      
      doc.save(`Invoice_${booking._id || booking.id}.pdf`);
      toast.success("Invoice downloaded!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate invoice.");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownload}
      className="flex items-center gap-1 text-[var(--forest)] border-[var(--forest)] hover:bg-[var(--forest)] hover:text-white"
    >
      <Download className="w-4 h-4" />
      Invoice
    </Button>
  );
}
