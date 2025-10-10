import mongoose, { Schema, Document } from "mongoose";

export interface IReportDocument extends Document {
  card_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: Date;
  updated_at: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    card_id: {
      type: String,
      required: true,
      index: true,
    },
    reporter_id: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "inappropriate_content",
        "spam",
        "fake_information",
        "copyright",
        "other",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "resolved", "dismissed"],
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const ReportModel = mongoose.model<IReportDocument>(
  "Report",
  ReportSchema
);
