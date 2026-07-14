import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";
import { auth } from "@/lib/auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { comment, rating } = body;

    if (!comment || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Invalid review data" }, { status: 400 });
    }

    const space = await Space.findById(id);

    if (!space) {
      return NextResponse.json({ success: false, message: "Space not found" }, { status: 404 });
    }

    const newReview = {
      userName: session.user.name,
      comment,
      rating: Number(rating),
      createdAt: new Date(),
    };

    space.reviews.push(newReview);

    // Recalculate average rating
    const totalRating = space.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    space.rating = totalRating / space.reviews.length;

    await space.save();

    return NextResponse.json({ success: true, data: space });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
