import mongoose, { Schema, Document } from "mongoose";

export interface IFeedbackDocument extends Document {
  card_id: string;
  user_id: string;
  feedback_type: string;
  subject: string;
  message: string;
  email?: string;
  rating?: number;
  status: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const FeedbackSchema = new Schema<IFeedbackDocument>(
  {
    card_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    feedback_type: {
      type: String,
      required: true,
      enum: ["general", "bug", "feature", "improvement", "question"],
      index: true,
    },
    subject: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewed", "resolved"],
      index: true,
    },
    admin_notes: {
      type: String,
      maxlength: 1000,
    },
    reviewed_by: {
      type: String,
    },
    reviewed_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "feedback",
  }
);

// Compound indexes
FeedbackSchema.index({ user_id: 1, created_at: -1 });
FeedbackSchema.index({ status: 1, created_at: -1 });
FeedbackSchema.index({ feedback_type: 1, status: 1 });
FeedbackSchema.index({ card_id: 1, user_id: 1, created_at: -1 });

export const FeedbackModel = mongoose.model<IFeedbackDocument>(
  "Feedback",
  FeedbackSchema
);
