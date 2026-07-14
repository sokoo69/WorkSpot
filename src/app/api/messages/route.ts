import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Message from "@/models/Message";
import Booking from "@/models/Booking";
import Space from "@/models/Space";
import { pusherServer } from "@/lib/pusherServer";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ success: false, message: "bookingId required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Authorization: User must be either the booker or the owner of the space
    const booking = await Booking.findById(bookingId).populate('spaceId');
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const spaceId = booking.spaceId._id || booking.spaceId;
    const space = await Space.findById(spaceId);
    if (!space) {
       return NextResponse.json({ success: false, message: "Space not found" }, { status: 404 });
    }

    const isBooker = booking.userId === session.user.id;
    const isOwner = space.ownerId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isBooker && !isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const messages = await Message.find({ bookingId }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: messages });
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

    const { bookingId, text } = await request.json();

    if (!bookingId || !text) {
      return NextResponse.json({ success: false, message: "bookingId and text required" }, { status: 400 });
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId).populate('spaceId');
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const spaceId = booking.spaceId._id || booking.spaceId;
    const space = await Space.findById(spaceId);
    if (!space) {
       return NextResponse.json({ success: false, message: "Space not found" }, { status: 404 });
    }

    const isBooker = booking.userId === session.user.id;
    const isOwner = space.ownerId === session.user.id;

    if (!isBooker && !isOwner) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const newMessage = await Message.create({
      bookingId,
      spaceId,
      bookerId: booking.userId,
      ownerId: space.ownerId,
      senderId: session.user.id,
      text,
    });

    // Trigger Pusher event on this conversation's channel
    // Channel name: chat-{bookingId} (unique per booking context)
    const channelName = `chat-${bookingId}`;
    
    // We send a plain JS object, not the Mongoose document directly, though Mongoose docs stringify to JSON fine
    const messageData = {
      _id: newMessage._id,
      bookingId: newMessage.bookingId,
      spaceId: newMessage.spaceId,
      bookerId: newMessage.bookerId,
      ownerId: newMessage.ownerId,
      senderId: newMessage.senderId,
      text: newMessage.text,
      createdAt: newMessage.createdAt,
    };

    try {
      await pusherServer.trigger(channelName, "new-message", messageData);
    } catch (e) {
      console.error("Pusher trigger failed:", e);
    }

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
