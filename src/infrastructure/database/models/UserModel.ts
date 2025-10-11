// src/infrastructure/database/models/UserModel.ts
import mongoose, { Schema, Document } from "mongoose";

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export interface IUserDocument extends Document {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  isAdmin: boolean;

  // Domain Verification (Profile-based)
  domainKey?: string;
  subcategoryKey?: string;
  domainVerified?: boolean;
  domainDocumentUrl?: string;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator", "super_admin"],
      default: "user",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Domain Verification Fields
    domainKey: {
      type: String,
      index: true,
    },
    subcategoryKey: {
      type: String,
      index: true,
    },
    domainVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    domainDocumentUrl: {
      type: String,
    },
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      index: true,
    },
    verificationNotes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Indexes for verification queries
UserSchema.index({ verificationStatus: 1, domainVerified: 1 });
UserSchema.index({ domainKey: 1, subcategoryKey: 1 });

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
