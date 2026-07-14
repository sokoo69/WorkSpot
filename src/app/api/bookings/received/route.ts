import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import Space from "@/models/Space";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const mongooseInstance = await connectToDatabase();
    const db = mongooseInstance.connection.db;
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Find spaces owned by this user
    const spaces = await Space.find({ ownerId: session.user.id }).lean();
    if (spaces.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const spaceIds = spaces.map(s => s._id);

    // Find bookings for these spaces
    const bookings = await Booking.find({ spaceId: { $in: spaceIds } }).sort({ date: -1 }).lean();

    // Fetch booker details from the `user` collection
    const bookerIds = [...new Set(bookings.map(b => b.userId))];
    const bookers = await db.collection("user").find({ id: { $in: bookerIds } }).toArray();
    
    // Fallback: If better-auth uses string _id for id, we might need to check both
    let actualBookers = bookers;
    if (bookers.length === 0 && bookerIds.length > 0) {
       // try matching by _id string
       actualBookers = await db.collection("user").find({ _id: { $in: bookerIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
       if (actualBookers.length === 0) {
          actualBookers = await db.collection("user").find({ _id: { $in: bookerIds } }).toArray();
       }
    }

    const bookersMap = actualBookers.reduce((acc: any, booker: any) => {
      // support both id formats
      const key = booker.id || booker._id.toString();
      acc[key] = {
        name: booker.name,
        email: booker.email,
        phoneNumber: booker.phoneNumber || "N/A"
      };
      return acc;
    }, {} as Record<string, any>);

    const spacesMap = spaces.reduce((acc: any, space: any) => {
      acc[space._id.toString()] = space.title;
      return acc;
    }, {} as Record<string, string>);

    // Combine the data
    const enrichedBookings = bookings.map(b => ({
      ...b,
      _id: b._id.toString(),
      id: b._id.toString(),
      spaceId: b.spaceId.toString(),
      spaceTitle: spacesMap[b.spaceId.toString()] || "Unknown Space",
      booker: bookersMap[b.userId] || { name: "Unknown", email: "N/A", phoneNumber: "N/A" }
    }));

    return NextResponse.json({ success: true, data: enrichedBookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
