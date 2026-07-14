import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";
import Booking from "@/models/Booking";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Get all spaces owned by this user
    const spaces = await Space.find({ ownerId: session.user.id }).lean();
    const spaceIds = spaces.map(s => s._id);

    // 2. Get all bookings for these spaces
    const bookings = await Booking.find({ spaceId: { $in: spaceIds } }).lean();

    // 3. Calculate metrics
    const totalSpaces = spaces.length;
    
    // Total Revenue (only paid bookings)
    const validBookings = bookings.filter(b => b.paymentStatus === "paid" && b.status !== "cancelled");
    const totalRevenue = validBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Upcoming Bookings
    const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const upcomingBookings = validBookings.filter(b => b.date >= now).length;

    // 4. Generate Chart Data (Revenue by month for last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const nowObj = new Date();
    const currentYear = nowObj.getFullYear();
    const currentMonth = nowObj.getMonth();
    
    const chartDataMap: Record<string, { name: string, revenue: number }> = {};
    const chartData = [];
    
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) {
        m += 12;
        y -= 1;
      }
      const key = `${y}-${m}`;
      const entry = { name: monthNames[m], revenue: 0 };
      chartDataMap[key] = entry;
      chartData.push(entry);
    }

    validBookings.forEach(b => {
      if (!b.date) return;
      const parts = b.date.split('-');
      if (parts.length === 3) {
        const bYear = parseInt(parts[0], 10);
        const bMonth = parseInt(parts[1], 10) - 1;
        const key = `${bYear}-${bMonth}`;
        if (chartDataMap[key]) {
          chartDataMap[key].revenue += b.totalPrice;
        }
      }
    });

    // 5. Recent Bookings (Detailed list for the dashboard table)
    const spacesMap = spaces.reduce((acc, space) => {
      acc[space._id.toString()] = space.title;
      return acc;
    }, {} as any);

    const recentBookingsList = bookings
      .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime())
      .slice(0, 5)
      .map(b => ({
        id: b._id.toString(),
        spaceName: spacesMap[b.spaceId.toString()] || "Unknown Space",
        date: b.date,
        time: `${b.startTime} - ${b.endTime}`,
        amount: b.totalPrice,
        status: b.status,
        paymentStatus: b.paymentStatus,
      }));

    // If admin, generate platform-wide analytics
    let adminAnalytics = null;
    if ((session.user as any).role === "admin") {
      const allBookings = await Booking.find().lean();
      
      const adminChartDataMap: Record<string, { name: string, bookings: number, users: number }> = {};
      const adminChartData = [];
      
      for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m < 0) { m += 12; y -= 1; }
        const key = `${y}-${m}`;
        const entry = { name: monthNames[m], bookings: 0, users: 0 };
        adminChartDataMap[key] = entry;
        adminChartData.push(entry);
      }

      allBookings.forEach(b => {
        if (!b.createdAt) return;
        const d = new Date(b.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (adminChartDataMap[key]) adminChartDataMap[key].bookings += 1;
      });

      // Rough estimate for user growth by mocking (we'd usually group the user collection by createdAt)
      // Since we don't have user.createdAt easily accessible via Better Auth here without querying DB,
      // we can just return the bookings data for the admin chart for now.
      adminAnalytics = {
        chartData: adminChartData
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalRevenue,
          upcomingBookings,
          totalSpaces,
        },
        chartData,
        recentBookings: recentBookingsList,
        rawBookings: validBookings,
        adminAnalytics
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
