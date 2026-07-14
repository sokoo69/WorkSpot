import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import Space from "@/models/Space";
import { pusherServer } from "@/lib/pusherServer";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    // SSLCommerz sends data as form-urlencoded
    const formData = await request.formData();
    const tran_id = formData.get("tran_id") as string;

    if (!tran_id || !status) {
      const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL}/en/bookings/my?error=invalid_callback`;
      return new NextResponse(`<html><body><script>window.location.href="${errorUrl}";</script></body></html>`, { headers: { "Content-Type": "text/html" } });
    }

    await connectToDatabase();
    
    let bookings = [];
    if (tran_id.length === 24) {
      bookings = await Booking.find({ 
        $or: [ { _id: tran_id }, { groupId: tran_id } ]
      });
    } else {
      bookings = await Booking.find({ groupId: tran_id });
    }

    if (!bookings || bookings.length === 0) {
      const notFoundUrl = `${process.env.NEXT_PUBLIC_APP_URL}/en/bookings/my?error=booking_not_found`;
      return new NextResponse(`<html><body><script>window.location.href="${notFoundUrl}";</script></body></html>`, { headers: { "Content-Type": "text/html" } });
    }

    if (status === "success") {
      for (const booking of bookings) {
        booking.paymentStatus = "paid";
        booking.status = "confirmed";
        await booking.save();
      }

      // --- Trigger Real-Time Pusher Event ---
      if (bookings.length > 0) {
        try {
          const spaceId = bookings[0].spaceId.toString();
          // Broadcast to everyone listening to this space's channel
          await pusherServer.trigger(`space-${spaceId}`, "slot-booked", {
            dates: bookings.map(b => b.date),
            startTime: bookings[0].startTime,
            endTime: bookings[0].endTime
          });
        } catch (e) {
          console.error("Pusher trigger failed:", e);
        }
      }

      // --- Send Email Confirmation via Resend ---
      if (bookings.length > 0) {
        // We use fire and forget by not awaiting a blocking wrap, though sendEmail catches its own errors
        const userDb = (await connectToDatabase()).connection.db;
        const userDoc = await userDb.collection("user").findOne({ 
          $or: [{ id: bookings[0].userId }, { _id: bookings[0].userId }]
        });
        
        const spaceDoc = await Space.findById(bookings[0].spaceId);
        const ownerDoc = await userDb.collection("user").findOne({ 
          $or: [{ id: spaceDoc?.ownerId }, { _id: spaceDoc?.ownerId }]
        });
        const totalAmount = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

        if (userDoc?.email) {
          sendEmail({
            to: userDoc.email,
            subject: "Booking Confirmed - WorkSpot",
            html: `
              <h1>Your booking is confirmed!</h1>
              <p>Your booking for <strong>${spaceDoc?.title || "Workspace"}</strong> is confirmed.</p>
              <p><strong>Total Paid:</strong> ${totalAmount} BDT</p>
              <p><strong>Dates:</strong> ${bookings.map(b => b.date).join(", ")}</p>
              <p><strong>Time:</strong> ${bookings[0].startTime} - ${bookings[0].endTime}</p>
              <br />
              <p>You can download your official invoice from your dashboard.</p>
            `
          });
        }

        if (ownerDoc?.email) {
          sendEmail({
            to: ownerDoc.email,
            subject: "New Booking Received - WorkSpot",
            html: `
              <h1>New Booking Alert</h1>
              <p>You have a new booking on <strong>${spaceDoc?.title || "Workspace"}</strong>.</p>
              <p><strong>Booker:</strong> ${userDoc?.name || "User"}</p>
              <p><strong>Contact:</strong> ${userDoc?.email}</p>
              <p><strong>Dates:</strong> ${bookings.map(b => b.date).join(", ")}</p>
              <p><strong>Time:</strong> ${bookings[0].startTime} - ${bookings[0].endTime}</p>
            `
          });
        }
      }
    } else {
      for (const booking of bookings) {
        booking.paymentStatus = "failed";
        booking.status = "cancelled";
        await booking.save();
      }
    }

    // Redirect the user back to their bookings page using JS to preserve SameSite=Lax cookies
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/en/bookings/my?payment=${status}`;
    return new NextResponse(`
      <html>
        <head>
          <title>Processing Payment...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f7f9f9; }
            .loader { text-align: center; }
          </style>
        </head>
        <body>
          <div class="loader">
            <h2>Payment ${status === 'success' ? 'Successful' : 'Processed'}!</h2>
            <p>Redirecting you back to your bookings...</p>
            <script>
              setTimeout(function() {
                window.location.href = "${successUrl}";
              }, 500);
            </script>
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error: any) {
    console.error("Payment callback error:", error);
    const errUrl = `${process.env.NEXT_PUBLIC_APP_URL}/en/bookings/my?error=server_error`;
    return new NextResponse(`<html><body><script>window.location.href="${errUrl}";</script></body></html>`, { headers: { "Content-Type": "text/html" } });
  }
}
