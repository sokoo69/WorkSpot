import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const db = (await connectToDatabase()).connection.db;
    
    const users = await db.collection("user").find({}).sort({ createdAt: -1 }).toArray();

    const serializedUsers = users.map((u: any) => ({
      id: u.id || u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role || "user",
      isVerifiedOwner: u.isVerifiedOwner || false,
      createdAt: u.createdAt
    }));

    return NextResponse.json({ success: true, data: serializedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    const db = (await connectToDatabase()).connection.db;
    
    if (userId === session.user.id) {
      return NextResponse.json({ success: false, message: "Cannot delete yourself" }, { status: 400 });
    }

    // Fetch the target user to check their role
    const query: any = { $or: [{ id: userId }, { _id: userId }] };
    if (ObjectId.isValid(userId)) {
      query.$or.push({ _id: new ObjectId(userId) });
    }

    const targetUser = await db.collection("user").findOne(query);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    if (targetUser.role === "admin") {
      return NextResponse.json({ success: false, message: "Cannot delete another admin account" }, { status: 403 });
    }

    // Cascade delete user's spaces
    await Space.deleteMany({ ownerId: userId });
    
    // Delete user's bookings (optional but good practice)
    await db.collection("bookings").deleteMany({ userId: userId });
    await db.collection("session").deleteMany({ userId });
    await db.collection("account").deleteMany({ userId });

    await db.collection("user").deleteOne(query);

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
