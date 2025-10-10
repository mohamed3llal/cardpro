import mongoose, { Document, Schema } from "mongoose";

export interface IFeedbackDocument extends Document {
  user_id: string;
  type: "bug" | "feature" | "general";
  message: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: Date;
  updated_at: Date;
}

const FeedbackSchema = new Schema<IFeedbackDocument>(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["bug", "feature", "general"],
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewed", "resolved"],
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const FeedbackModel = mongoose.model<IFeedbackDocument>(
  "Feedback",
  FeedbackSchema
);
