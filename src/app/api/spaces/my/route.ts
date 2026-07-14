import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const spaces = await Space.find({ ownerId: session.user.id }).sort({ createdAt: -1 }).lean();

    const serializedSpaces = spaces.map(space => ({
      ...space,
      _id: space._id.toString(),
      id: space._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedSpaces
    });
  } catch (error: any) {
    console.error("GET /api/spaces/my error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
