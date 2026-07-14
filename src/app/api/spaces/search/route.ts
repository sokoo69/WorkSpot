import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    await connectToDatabase();

    const spaces = await Space.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ],
    })
      .select("title city id _id")
      .limit(5)
      .lean();

    const formattedSpaces = spaces.map(s => ({
      id: s._id.toString(),
      title: s.title,
      city: s.city
    }));

    return NextResponse.json({ success: true, data: formattedSpaces });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
