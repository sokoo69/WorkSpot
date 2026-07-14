import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import VerificationRequest from "@/models/VerificationRequest";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find the most recent verification request for the user
    const kycRequest = await VerificationRequest.findOne({ userId: session.user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: kycRequest });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { nidNumber, nidImageUrl, businessLicenseUrl } = await request.json();

    if (!nidNumber || !nidImageUrl) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if a pending request already exists
    const existing = await VerificationRequest.findOne({ userId: session.user.id, status: "pending" });
    if (existing) {
      return NextResponse.json({ success: false, message: "A pending request already exists" }, { status: 400 });
    }

    const newRequest = await VerificationRequest.create({
      userId: session.user.id,
      nidNumber,
      nidImageUrl,
      businessLicenseUrl,
      status: "pending",
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
