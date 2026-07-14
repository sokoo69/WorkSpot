import mongoose, { Schema, Document } from "mongoose";

export interface IReview {
  userName: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

export interface ISpace extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  location: string;
  city: string;
  pricePerHour: number;
  category: "Private Room" | "Shared Desk" | "Meeting Room" | "Conference Hall";
  amenities: string[];
  capacity: number;
  rating: number;
  reviews: IReview[];
  ownerId: string;
  views: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  userName: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const SpaceSchema = new Schema<ISpace>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true, maxlength: 150 },
  fullDescription: { type: String, required: true },
  images: { type: [String], required: true, validate: (v: string[]) => v.length > 0 },
  location: { type: String, required: true },
  city: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Private Room", "Shared Desk", "Meeting Room", "Conference Hall"],
    required: true,
  },
  amenities: { type: [String], default: [] },
  capacity: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: [ReviewSchema], default: [] },
  ownerId: { type: String, required: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Space || mongoose.model<ISpace>("Space", SpaceSchema);
