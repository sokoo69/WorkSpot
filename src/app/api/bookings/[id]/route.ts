import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import { auth } from "@/lib/auth";
import Space from "@/models/Space";
import { pusherServer } from "@/lib/pusherServer";
import { sendEmail } from "@/lib/email";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Instead of deleting from DB, mark as cancelled
    booking.status = "cancelled";
    await booking.save();

    // Trigger Pusher
    try {
      await pusherServer.trigger(`space-${booking.spaceId}`, "slot-freed", {
        dates: [booking.date]
      });
    } catch (e) {
      console.error("Pusher trigger failed:", e);
    }

    // Email Owner
    try {
      const spaceDoc = await Space.findById(booking.spaceId);
      if (spaceDoc) {
        const userDb = (await connectToDatabase()).connection.db;
        const ownerDoc = await userDb.collection("user").findOne({ 
          $or: [{ id: spaceDoc.ownerId }, { _id: spaceDoc.ownerId }]
        });
        const bookerDoc = await userDb.collection("user").findOne({
          $or: [{ id: booking.userId }, { _id: booking.userId }]
        });

        if (ownerDoc?.email) {
          sendEmail({
            to: ownerDoc.email,
            subject: "Booking Cancelled - WorkSpot",
            html: `
              <h1>Booking Cancelled</h1>
              <p>${bookerDoc?.name || "A user"}'s booking for <strong>${booking.date}</strong> on <strong>${spaceDoc.title}</strong> was cancelled.</p>
              <p>This time slot is now available for others to book.</p>
            `
          });
        }
      }
    } catch (e) {
      console.error("Email trigger failed:", e);
    }

    return NextResponse.json({ success: true, message: "Booking cancelled" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
