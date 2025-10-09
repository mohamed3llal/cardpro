import mongoose, { Schema, Document } from "mongoose";
import { Domain } from "@domain/entities/Domain";

export interface IDomainDocument extends Document {
  key: string;
  ar: string;
  fr: string;
  en: string;
  keywords: {
    ar: string[];
    fr: string[];
    en: string[];
  };
  subcategories: Array<{
    key: string;
    category_key: string;
    ar: string;
    fr: string;
    en: string;
    keywords: {
      ar: string[];
      fr: string[];
      en: string[];
    };
  }>;
  created_at: Date;
  updated_at: Date;
}

const SubcategorySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[a-z_]+$/,
    },
    category_key: {
      type: String,
      required: true,
    },
    ar: {
      type: String,
      required: true,
    },
    fr: {
      type: String,
      required: true,
    },
    en: {
      type: String,
      required: true,
    },
    keywords: {
      ar: {
        type: [String],
        required: true,
        validate: [
          (val: string[]) => val.length > 0,
          "Arabic keywords cannot be empty",
        ],
      },
      fr: {
        type: [String],
        required: true,
        validate: [
          (val: string[]) => val.length > 0,
          "French keywords cannot be empty",
        ],
      },
      en: {
        type: [String],
        required: true,
        validate: [
          (val: string[]) => val.length > 0,
          "English keywords cannot be empty",
        ],
      },
    },
  },
  { _id: false }
);

const DomainSchema = new Schema<IDomainDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[a-z_]+$/,
      index: true,
    },
    ar: {
      type: String,
      required: true,
    },
    fr: {
      type: String,
      required: true,
    },
    en: {
      type: String,
      required: true,
    },
    keywords: {
      ar: {
        type: [String],
        required: true,
        validate: [
          (val: string[]) => val.length > 0,
          "Arabic keywords cannot be empty",
        ],
      },
      fr: {
        type: [String],
        required: true,
        validate: [
          (val: string[]) => val.length > 0,
          "French keywords cannot be empty",
        ],
      },
      en: {
        type: [String],
        required: true,
        validate: [
          (val: string[]) => val.length > 0,
          "English keywords cannot be empty",
        ],
      },
    },
    subcategories: {
      type: [SubcategorySchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

// Ensure subcategory keys are unique across all domains
DomainSchema.index({ "subcategories.key": 1 }, { unique: true, sparse: true });

// Pre-save hook to auto-assign category_key to subcategories
DomainSchema.pre("save", function (next) {
  if (this.subcategories && this.subcategories.length > 0) {
    this.subcategories = this.subcategories.map((sub) => ({
      ...sub,
      category_key: this.key,
    }));
  }
  next();
});

export const DomainModel = mongoose.model<IDomainDocument>(
  "Domain",
  DomainSchema
);
