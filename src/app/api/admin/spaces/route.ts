import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    
    const spaces = await Space.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: spaces });
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
    const spaceId = searchParams.get("id");

    if (!spaceId) {
      return NextResponse.json({ success: false, message: "Space ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    await Space.findByIdAndDelete(spaceId);

    return NextResponse.json({ success: true, message: "Space deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
