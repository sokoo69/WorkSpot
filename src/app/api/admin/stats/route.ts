import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";
import Booking from "@/models/Booking";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    
    const db = (await connectToDatabase()).connection.db;
    const usersCount = await db.collection("user").countDocuments();

    const spacesCount = await Space.countDocuments();
    const bookingsCount = await Booking.countDocuments();

    const bookings = await Booking.find({ paymentStatus: "paid" }).lean();
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const allBookings = await Booking.find().lean();
    const allUsers = await db.collection("user").find().toArray();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const nowObj = new Date();
    const currentYear = nowObj.getFullYear();
    const currentMonth = nowObj.getMonth();
    
    const growthDataMap: Record<string, { name: string, bookings: number, users: number }> = {};
    const growthData = [];
    
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) { m += 12; y -= 1; }
      const key = `${y}-${m}`;
      const entry = { name: monthNames[m], bookings: 0, users: 0 };
      growthDataMap[key] = entry;
      growthData.push(entry);
    }

    allBookings.forEach(b => {
      if (!b.createdAt) return;
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (growthDataMap[key]) growthDataMap[key].bookings += 1;
    });

    allUsers.forEach((u: any) => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (growthDataMap[key]) growthDataMap[key].users += 1;
    });

    // Get categories distribution
    const spaces = await Space.find().lean();
    const categoryCounts = spaces.reduce((acc, space) => {
      acc[space.category] = (acc[space.category] || 0) + 1;
      return acc;
    }, {} as any);

    const categoryData = Object.keys(categoryCounts).map(key => ({
      name: key,
      value: categoryCounts[key]
    }));

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          users: usersCount,
          spaces: spacesCount,
          bookings: bookingsCount,
          revenue: totalRevenue
        },
        categoryData,
        growthData
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
