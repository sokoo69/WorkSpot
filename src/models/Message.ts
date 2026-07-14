import mongoose from "mongoose";

export interface IMessage extends mongoose.Document {
  bookingId: string;
  spaceId: string;
  bookerId: string;
  ownerId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

const MessageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    bookerId: {
      type: String, // String because Better-Auth uses string IDs
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes to speed up conversation fetching
MessageSchema.index({ bookingId: 1, createdAt: 1 });

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
