import mongoose from "mongoose";

export interface IVerificationRequest extends mongoose.Document {
  userId: string;
  nidNumber: string;
  nidImageUrl: string;
  businessLicenseUrl?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

const VerificationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    nidNumber: {
      type: String,
      required: true,
    },
    nidImageUrl: {
      type: String,
      required: true,
    },
    businessLicenseUrl: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      required: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      required: false,
    },
    reviewedBy: {
      type: String, // Admin user ID
      required: false,
    },
  },
  { timestamps: true }
);

const VerificationRequest =
  mongoose.models.VerificationRequest ||
  mongoose.model<IVerificationRequest>("VerificationRequest", VerificationRequestSchema);

export default VerificationRequest;
