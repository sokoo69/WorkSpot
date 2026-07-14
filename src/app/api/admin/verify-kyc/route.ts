import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/lib/email";
import VerificationRequest from "@/models/VerificationRequest";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { requestId, status, rejectionReason } = await request.json();

    if (!requestId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const db = (await connectToDatabase()).connection.db;
    
    const kycRequest = await VerificationRequest.findById(requestId);
    if (!kycRequest) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    // Update the request
    kycRequest.status = status;
    kycRequest.reviewedAt = new Date();
    kycRequest.reviewedBy = session.user.id;
    if (status === "rejected" && rejectionReason) {
      kycRequest.rejectionReason = rejectionReason;
    }
    await kycRequest.save();

    const userId = kycRequest.userId;
    const isVerifiedOwner = status === "approved";

    const query: any = { $or: [{ id: userId }, { _id: userId }] };
    if (ObjectId.isValid(userId)) {
      query.$or.push({ _id: new ObjectId(userId) });
    }

    const userDoc = await db.collection("user").findOne(query);

    if (userDoc) {
      // Only update the user flag if approved (or if rejected, we might want to ensure it's false, but typically we only set it on approval)
      await db.collection("user").updateOne(
        query,
        { $set: { isVerifiedOwner } }
      );

      if (userDoc.email) {
        if (status === "approved") {
          sendEmail({
            to: userDoc.email,
            subject: "KYC Verification Approved - WorkSpot",
            html: `
              <h1>Verification Approved!</h1>
              <p>Congratulations, your WorkSpot verification has been approved.</p>
              <p>Your profile now shows a Verified badge, giving you more trust with your customers.</p>
            `
          });
        } else if (status === "rejected") {
          sendEmail({
            to: userDoc.email,
            subject: "KYC Verification Rejected - WorkSpot",
            html: `
              <h1>Verification Request Update</h1>
              <p>Unfortunately, your verification request was not approved.</p>
              <p>Reason: ${rejectionReason || 'Documents were unclear or invalid.'}</p>
              <p>Please double-check your documents and ensure they are clear and up-to-date before submitting again.</p>
            `
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: kycRequest });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
