import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minCapacity = searchParams.get("minCapacity");
    const sort = searchParams.get("sort") || "createdAt_desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (city) query.city = city;
    
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }
    
    if (minCapacity) query.capacity = { $gte: Number(minCapacity) };

    let sortObj: any = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { pricePerHour: 1 };
    else if (sort === "price_desc") sortObj = { pricePerHour: -1 };
    else if (sort === "rating_desc") sortObj = { rating: -1 };

    const skip = (page - 1) * limit;

    const [spaces, total] = await Promise.all([
      Space.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Space.countDocuments(query),
    ]);

    // Ensure we serialize IDs for client
    const serializedSpaces = spaces.map(space => ({
      ...space,
      _id: space._id.toString(),
      id: space._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        spaces: serializedSpaces,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/spaces error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const space = new Space({
      ...body,
      ownerId: session.user.id,
    });

    await space.save();

    return NextResponse.json({ success: true, data: space }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/spaces error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
