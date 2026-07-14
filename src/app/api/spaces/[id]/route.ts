import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";
import { auth } from "@/lib/auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const space = await Space.findById(id).lean();

    if (!space) {
      return NextResponse.json({ success: false, message: "Space not found" }, { status: 404 });
    }

    // Usually we would populate owner name. Better Auth users are in a separate collection, 
    // let's fetch the owner name. But Mongoose doesn't know about Better Auth collections.
    // For now, return the space. We can fetch owner info in a separate query or leave ownerId.
    // We will attempt to get user info if possible.
    
    const db = (await connectToDatabase()).connection.db;
    const owner = await db.collection("user").findOne({ id: space.ownerId });

    return NextResponse.json({
      success: true,
      data: {
        ...space,
        _id: space._id.toString(),
        id: space._id.toString(),
        ownerName: owner?.name || "Unknown Owner"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const space = await Space.findById(id);

    if (!space) {
      return NextResponse.json({ success: false, message: "Space not found" }, { status: 404 });
    }

    // Admin can delete any space. Owner can only delete their own.
    if (space.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await Space.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Space deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
