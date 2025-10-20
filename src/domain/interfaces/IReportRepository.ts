import { Report } from "@domain/entities/Report";

export interface IReportRepository {
  create(report: Report): Promise<Report>;
  findById(id: string): Promise<Report | null>;
  findByCardAndUser(cardId: string, userId: string): Promise<Report | null>;
  findByUserId(userId: string): Promise<Report[]>;
  findAll(
    page: number,
    limit: number,
    filters?: {
      status?: string;
      report_type?: string;
    }
  ): Promise<{ reports: Report[]; total: number }>;
  update(id: string, report: Report): Promise<Report | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(filters?: any): Promise<number>;
}

// src/infrastructure/database/models/ReportModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IReportDocument extends Document {
  card_id: string;
  user_id: string;
  report_type: string;
  details?: string;
  status: string;
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: Date;
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
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    report_type: {
      type: String,
      required: true,
      enum: ["inappropriate", "incorrect", "spam", "copyright", "other"],
      index: true,
    },
    details: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "resolved", "dismissed"],
      index: true,
    },
    admin_notes: {
      type: String,
      maxlength: 1000,
    },
    resolved_by: {
      type: String,
    },
    resolved_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "reports",
  }
);

// Compound indexes for efficient queries
ReportSchema.index({ card_id: 1, user_id: 1 }, { unique: true });
ReportSchema.index({ user_id: 1, created_at: -1 });
ReportSchema.index({ status: 1, created_at: -1 });
ReportSchema.index({ report_type: 1, status: 1 });

export const ReportModel = mongoose.model<IReportDocument>(
  "Report",
  ReportSchema
);
