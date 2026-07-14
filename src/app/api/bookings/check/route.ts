import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get("spaceId");
    const date = searchParams.get("date");

    if (!spaceId) {
      return NextResponse.json(
        { success: false, message: "Missing spaceId" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const query: any = {
      spaceId,
      status: { $ne: "cancelled" }
    };
    
    if (date) {
      query.date = date;
    } else {
      // If no date, only return future bookings
      query.date = { $gte: new Date().toISOString().split("T")[0] };
    }

    // Fetch existing confirmed bookings for this space
    const bookings = await Booking.find(query)
      .select("date startTime endTime")
      .lean();

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
