import mongoose, { Document, Schema } from "mongoose";
export interface ISubscriptionDocument extends Document {
  user_id: string;
  plan: "free" | "pro" | "premium";
  status: "active" | "cancelled" | "expired";
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "cancelled", "expired"],
      default: "active",
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const SubscriptionModel = mongoose.model<ISubscriptionDocument>(
  "Subscription",
  SubscriptionSchema
);
