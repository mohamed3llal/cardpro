import mongoose, { Schema, Document } from "mongoose";

export interface IFavoriteDocument extends Document {
  user_id: string;
  business_id: string;
  created_at: Date;
}

const FavoriteSchema = new Schema<IFavoriteDocument>(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    business_id: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    collection: "favorites",
  }
);

// Compound index to ensure a user can't favorite the same business twice
FavoriteSchema.index({ user_id: 1, business_id: 1 }, { unique: true });

// Index for efficient queries by user
FavoriteSchema.index({ user_id: 1, created_at: -1 });

export const FavoriteModel = mongoose.model<IFavoriteDocument>(
  "Favorite",
  FavoriteSchema
);
