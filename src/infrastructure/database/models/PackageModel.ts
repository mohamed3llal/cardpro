// src/infrastructure/database/models/PackageModel.ts

import mongoose, { Schema, Document } from "mongoose";
import {
  Package,
  PackageFeatures,
  PackageTier,
  BillingInterval,
} from "../../../domain/entities/Package";

export interface PackageDocument extends Omit<Package, "id">, Document {}

const packageFeaturesSchema = new Schema<PackageFeatures>(
  {
    maxCards: { type: Number, required: true, default: 1 },
    maxBoosts: { type: Number, required: true, default: 0 },
    canExploreCards: { type: Boolean, required: true, default: true },
    prioritySupport: { type: Boolean, required: true, default: false },
    verificationBadge: { type: Boolean, required: true, default: false },
    advancedAnalytics: { type: Boolean, required: true, default: false },
    customBranding: { type: Boolean, required: true, default: false },
    apiAccess: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const packageSchema = new Schema<PackageDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },
    tier: {
      type: String,
      required: true,
      enum: ["free", "basic", "premium", "business"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
    },
    interval: {
      type: String,
      required: true,
      enum: ["month", "year"],
    },
    features: {
      type: packageFeaturesSchema,
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scheduledActivateAt: {
      type: Date,
      default: null,
    },
    scheduledDeactivateAt: {
      type: Date,
      default: null,
    },
    subscriberCount: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
packageSchema.index({ tier: 1, isActive: 1 });
packageSchema.index({ isActive: 1 });

export const PackageModel = mongoose.model<PackageDocument>(
  "Package",
  packageSchema
);
