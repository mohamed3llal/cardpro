import mongoose, { Schema, Document } from "mongoose";

export interface IReviewDocument extends Document {
  business_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const ReviewModel = mongoose.model<IReviewDocument>(
  "Review",
  ReviewSchema
);
