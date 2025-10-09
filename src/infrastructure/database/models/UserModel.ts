import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "@domain/entities/User";

export interface IUserDocument extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isAdmin: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  bio?: string;
  city?: string;
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
      default: undefined,
    },
    avatar: {
      type: String,
      default: undefined,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      index: true,
    },
    bio: {
      type: String,
      default: undefined,
    },
    city: {
      type: String,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
