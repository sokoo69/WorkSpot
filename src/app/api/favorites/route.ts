import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { spaceId } = await request.json();
    if (!spaceId) {
      return NextResponse.json({ success: false, message: "Space ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // We interact directly with the user collection since better-auth stores additionalFields there
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    
    const userId = session.user.id;
    const objectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
    const userQuery = { $or: [{ id: userId }, { _id: userId }, ...(objectId ? [{ _id: objectId }] : [])] };
    
    const user = await db.collection("user").findOne(userQuery);
    
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    let favorites = user.favorites || [];
    
    if (favorites.includes(spaceId)) {
      // Remove
      favorites = favorites.filter((id: string) => id !== spaceId);
    } else {
      // Add
      favorites.push(spaceId);
    }

    await db.collection("user").updateOne(
      userQuery,
      { $set: { favorites } }
    );

    return NextResponse.json({ success: true, favorites });
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
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    
    const userId = session.user.id;
    const objectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
    const userQuery = { $or: [{ id: userId }, { _id: userId }, ...(objectId ? [{ _id: objectId }] : [])] };
    
    const user = await db.collection("user").findOne(userQuery);
    const favoriteIds = user?.favorites || [];

    const spaces = await Space.find({ _id: { $in: favoriteIds } }).lean();

    const serializedSpaces = spaces.map(space => ({
      ...space,
      _id: space._id.toString(),
      id: space._id.toString(),
      isFavorite: true,
    }));

    return NextResponse.json({ success: true, data: serializedSpaces });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
