import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  spaceId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  totalPrice: number;
  groupId?: string;
  status: "confirmed" | "cancelled" | "pending";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  spaceId: { type: String, required: true },
  userId: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  hours: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  groupId: { type: String, required: false },
  status: { type: String, enum: ["confirmed", "cancelled", "pending"], required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
