import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Booking from "@/models/Booking";
import Space from "@/models/Space";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { spaceId, date, startTime, endTime, hours, totalPrice, repeatWeekly } = body;

    if (!spaceId || !date || !startTime || !endTime) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const space = await Space.findById(spaceId);
    if (!space) {
      return NextResponse.json({ success: false, message: "Space not found" }, { status: 404 });
    }

    // Calculate conflict logic for single or multiple bookings
    const s1 = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
    const e1 = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

    const bookingsToCreate = [];
    const groupId = repeatWeekly ? new mongoose.Types.ObjectId().toString() : undefined;
    const basePrice = repeatWeekly ? totalPrice / 4 : totalPrice;
    const numWeeks = repeatWeekly ? 4 : 1;
    
    for (let w = 0; w < numWeeks; w++) {
      const bDate = new Date(date);
      bDate.setDate(bDate.getDate() + (w * 7));
      const dateStr = bDate.toISOString().split('T')[0];

      // Check conflicts for each date
      const existingBookings = await Booking.find({
        spaceId,
        date: dateStr,
        status: { $ne: "cancelled" }
      }).lean();

      for (const b of existingBookings) {
        const s2 = parseInt(b.startTime.split(":")[0]) * 60 + parseInt(b.startTime.split(":")[1]);
        const e2 = parseInt(b.endTime.split(":")[0]) * 60 + parseInt(b.endTime.split(":")[1]);
        if (Math.max(s1, s2) < Math.min(e1, e2)) {
          return NextResponse.json({ success: false, message: `This time slot overlaps with an existing reservation on ${dateStr}.` }, { status: 409 });
        }
      }

      bookingsToCreate.push(new Booking({
        spaceId,
        userId: session.user.id,
        date: dateStr,
        startTime,
        endTime,
        hours,
        totalPrice: basePrice,
        groupId,
        status: "pending",
        paymentStatus: "pending"
      }));
    }

    await Booking.insertMany(bookingsToCreate);

    const tran_id = repeatWeekly ? groupId : bookingsToCreate[0]._id.toString();
    const store_id = process.env.SSLCOMMERZ_STORE_ID;
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const is_live = process.env.SSLCOMMERZ_IS_LIVE === "true";
    
    if (!store_id || !store_passwd) {
      await Booking.deleteMany({ _id: { $in: bookingsToCreate.map(b => b._id) } });
      return NextResponse.json({ success: false, message: "SSLCommerz credentials missing in env" }, { status: 500 });
    }

    try {
      const params = new URLSearchParams();
      params.append("store_id", store_id);
      params.append("store_passwd", store_passwd);
      params.append("total_amount", totalPrice.toString());
      params.append("currency", "BDT");
      params.append("tran_id", tran_id as string);
      params.append("success_url", `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?status=success`);
      params.append("fail_url", `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?status=fail`);
      params.append("cancel_url", `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback?status=cancel`);
      params.append("cus_name", session.user.name || "User");
      params.append("cus_email", session.user.email || "customer@example.com");
      params.append("cus_add1", "Dhaka");
      params.append("cus_city", "Dhaka");
      params.append("cus_country", "Bangladesh");
      params.append("cus_phone", "01711111111");
      params.append("shipping_method", "No");
      params.append("product_name", space.title);
      params.append("product_category", "Booking");
      params.append("product_profile", "general");

      const apiUrl = is_live 
        ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php" 
        : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });

      const apiResponse = await response.json();

      if (!apiResponse?.GatewayPageURL) {
        throw new Error(apiResponse.failedreason || "Payment Gateway initialization failed");
      }

      return NextResponse.json({ 
        success: true, 
        redirectUrl: apiResponse.GatewayPageURL,
        data: bookingsToCreate[0] 
      }, { status: 201 });
    } catch (paymentError: any) {
      // Rollback database inserts if gateway initialization fails
      await Booking.deleteMany({ _id: { $in: bookingsToCreate.map(b => b._id) } });
      return NextResponse.json({ success: false, message: paymentError.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch bookings and manually join with spaces since they are separate collections
    const bookings = await Booking.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
    
    const spaceIds = bookings.map(b => b.spaceId);
    const spaces = await Space.find({ _id: { $in: spaceIds } }).lean();
    
    const ownerIds = [...new Set(spaces.map(s => s.ownerId).filter(Boolean))];
    const db = (await connectToDatabase()).connection.db;
    
    let actualOwners = await db.collection("user").find({ id: { $in: ownerIds } }).toArray();
    if (actualOwners.length === 0 && ownerIds.length > 0) {
      const mongoose = require("mongoose");
      actualOwners = await db.collection("user").find({ _id: { $in: ownerIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
      if (actualOwners.length === 0) {
        actualOwners = await db.collection("user").find({ _id: { $in: ownerIds } }).toArray();
      }
    }

    const ownersMap = actualOwners.reduce((acc: any, owner: any) => {
      const key = owner.id || owner._id.toString();
      acc[key] = {
        name: owner.name,
        email: owner.email,
        phoneNumber: owner.phoneNumber || "N/A"
      };
      return acc;
    }, {} as Record<string, any>);

    const spacesMap = spaces.reduce((acc: any, space: any) => {
      acc[space._id.toString()] = {
        ...space,
        owner: space.ownerId ? ownersMap[space.ownerId] : null
      };
      return acc;
    }, {} as any);

    const serializedBookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      id: booking._id.toString(),
      space: spacesMap[booking.spaceId] ? {
        title: spacesMap[booking.spaceId].title,
        image: spacesMap[booking.spaceId].images?.[0] || "",
        owner: spacesMap[booking.spaceId].owner || { name: "Unknown", email: "N/A", phoneNumber: "N/A" }
      } : null
    }));

    return NextResponse.json({ success: true, data: serializedBookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
