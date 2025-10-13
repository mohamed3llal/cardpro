import mongoose, { Schema, Document } from "mongoose";
import { CardProps } from "../../../domain/entities/Card";

export interface ICardDocument extends Omit<CardProps, "_id">, Document {}

const LocationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const SocialLinksSchema = new Schema(
  {
    whatsapp: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    facebook: { type: String },
  },
  { _id: false }
);

const CardSchema = new Schema<ICardDocument>(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    domain_key: {
      type: String,
      required: true,
      index: true,
    },
    subdomain_key: {
      type: [String],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mobile_phones: [
      {
        type: String,
        trim: true,
      },
    ],
    landline_phones: [
      {
        type: String,
        trim: true,
      },
    ],
    fax_numbers: [
      {
        type: String,
        trim: true,
      },
    ],
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    work_hours: {
      type: String,
      trim: true,
    },
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    social_links: {
      type: SocialLinksSchema,
      default: {},
    },
    location: {
      type: LocationSchema,
    },
    is_public: {
      type: Boolean,
      default: true,
      index: true,
    },
    scans: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "cards",
  }
);

// Indexes for common queries
CardSchema.index({ user_id: 1, created_at: -1 });
CardSchema.index({ domain_key: 1, is_public: 1 });
CardSchema.index({ created_at: -1 });
CardSchema.index({ views: -1 });
CardSchema.index({ scans: -1 });

// Text index for search functionality (optional)
CardSchema.index({
  title: "text",
  company: "text",
  description: "text",
  tags: "text",
});

export const CardModel = mongoose.model<ICardDocument>("Card", CardSchema);
