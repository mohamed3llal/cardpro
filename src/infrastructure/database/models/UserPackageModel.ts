import mongoose, { Schema, Document } from "mongoose";
import {
  UserPackage,
  PackageUsage,
  BoostCard,
} from "../../../domain/entities/Subscription";

export interface UserPackageDocument
  extends Omit<UserPackage, "id">,
    Document {}
export interface PackageUsageDocument
  extends Omit<PackageUsage, "id">,
    Document {}
export interface BoostCardDocument extends Omit<BoostCard, "id">, Document {}

// UserPackage (Subscription) Schema
const userPackageSchema = new Schema<UserPackageDocument>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    packageId: {
      type: String,
      ref: "Package",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      index: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    paymentMethodId: {
      type: String,
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

// Compound indexes
userPackageSchema.index({ userId: 1, status: 1 });
userPackageSchema.index({ packageId: 1, status: 1 });

// PackageUsage Schema
const packageUsageSchema = new Schema<PackageUsageDocument>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    packageId: {
      type: String,
      ref: "Package",
      required: true,
    },
    cardsCreated: {
      type: Number,
      default: 0,
      min: 0,
    },
    boostsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
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

packageUsageSchema.index({ userId: 1, packageId: 1 }, { unique: true });

// BoostCard Schema
const boostCardSchema = new Schema<BoostCardDocument>(
  {
    cardId: {
      type: String,
      ref: "Card",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
      index: true,
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
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

boostCardSchema.index({ cardId: 1, status: 1 });
boostCardSchema.index({ userId: 1, status: 1 });

export const UserPackageModel = mongoose.model<UserPackageDocument>(
  "UserPackage",
  userPackageSchema
);
export const PackageUsageModel = mongoose.model<PackageUsageDocument>(
  "PackageUsage",
  packageUsageSchema
);
export const BoostCardModel = mongoose.model<BoostCardDocument>(
  "BoostCard",
  boostCardSchema
);
