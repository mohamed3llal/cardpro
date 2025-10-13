import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsEventDocument extends Document {
  business_id: string;
  event_type: "view" | "scan" | "contact_click";
  source?: string;
  device?: string;
  contact_type?: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEventDocument>(
  {
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    event_type: {
      type: String,
      enum: ["view", "scan", "contact_click"],
      required: true,
      index: true,
    },
    source: String,
    device: String,
    contact_type: String,
    user_id: String,
    ip_address: String,
    user_agent: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "analytics_events",
    timeseries: {
      timeField: "timestamp",
      metaField: "business_id",
      granularity: "hours",
    },
  }
);

// Compound indexes for common queries
AnalyticsEventSchema.index({ business_id: 1, timestamp: -1 });
AnalyticsEventSchema.index({ business_id: 1, event_type: 1, timestamp: -1 });
AnalyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

export const AnalyticsEventModel = mongoose.model<IAnalyticsEventDocument>(
  "AnalyticsEvent",
  AnalyticsEventSchema
);
