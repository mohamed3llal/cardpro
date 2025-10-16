import mongoose, { Document, Schema } from "mongoose";
export interface INotificationSettingsDocument extends Document {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  mute_until?: Date;
  created_at: Date;
  updated_at: Date;
}

const NotificationSettingsSchema = new Schema<INotificationSettingsDocument>(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email_notifications: {
      type: Boolean,
      default: true,
    },
    push_notifications: {
      type: Boolean,
      default: true,
    },
    mute_until: Date,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const NotificationSettingsModel =
  mongoose.model<INotificationSettingsDocument>(
    "NotificationSettings",
    NotificationSettingsSchema
  );
