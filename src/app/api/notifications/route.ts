import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import Space from "@/models/Space";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Notifications for spaces owned by the user (someone booked your space)
    const ownedSpaces = await Space.find({ ownerId: session.user.id }).select("_id title").lean();
    const ownedSpaceIds = ownedSpaces.map(s => s._id);

    const receivedBookings = await Booking.find({ spaceId: { $in: ownedSpaceIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Notifications for bookings made by the user (your booking was confirmed/cancelled)
    const myBookings = await Booking.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const spaceMap = ownedSpaces.reduce((acc: any, s: any) => {
      acc[s._id.toString()] = s.title;
      return acc;
    }, {} as Record<string, string>);

    // Fetch titles for my bookings' spaces
    const mySpaceIds = myBookings.map(b => b.spaceId);
    const mySpacesData = await Space.find({ _id: { $in: mySpaceIds } }).select("_id title").lean();
    mySpacesData.forEach(s => {
      spaceMap[s._id.toString()] = s.title;
    });

    const notifications: any[] = [];

    receivedBookings.forEach(b => {
      notifications.push({
        id: `rec_${b._id}`,
        type: "received",
        title: "New Booking Received",
        message: `Someone booked ${spaceMap[b.spaceId] || "your space"} for ${b.date}.`,
        createdAt: b.createdAt || new Date(),
        status: b.status
      });
    });

    myBookings.forEach(b => {
      notifications.push({
        id: `my_${b._id}`,
        type: "made",
        title: b.status === "cancelled" ? "Booking Cancelled" : "Booking Confirmed",
        message: `Your booking for ${spaceMap[b.spaceId] || "a space"} on ${b.date} is ${b.status}.`,
        createdAt: b.createdAt || new Date(),
        status: b.status
      });
    });

    // Sort by createdAt desc, take top 10
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ success: true, data: notifications.slice(0, 10) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
