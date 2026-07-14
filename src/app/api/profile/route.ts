import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectToDatabase from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, image, phoneNumber } = body;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection failed");
    }

    // Prepare update payload
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    updateData.updatedAt = new Date();

    const userId = session.user.id;
    const objectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
    const userQuery = { $or: [{ id: userId }, { _id: userId }, ...(objectId ? [{ _id: objectId }] : [])] };

    const result = await db.collection("user").updateOne(
      userQuery,
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
