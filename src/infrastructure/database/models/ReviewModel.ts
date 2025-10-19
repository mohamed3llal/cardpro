import mongoose, { Schema, Document } from "mongoose";

export interface IReviewDocument extends Document {
  business_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  verified_purchase: boolean;
  helpful_votes: string[]; // Array of user IDs who marked as helpful
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
    user_name: {
      type: String,
      required: true,
    },
    user_avatar: {
      type: String,
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
      minlength: 3,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    helpful_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    verified_purchase: {
      type: Boolean,
      default: false,
    },
    helpful_votes: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "reviews",
  }
);

// Compound indexes
ReviewSchema.index({ business_id: 1, created_at: -1 });
ReviewSchema.index({ user_id: 1, business_id: 1 }, { unique: true });
ReviewSchema.index({ business_id: 1, rating: -1 });
ReviewSchema.index({ created_at: -1 });

export const ReviewModel = mongoose.model<IReviewDocument>(
  "Review",
  ReviewSchema
);
