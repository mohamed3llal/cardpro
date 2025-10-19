import mongoose, { Schema, Document } from "mongoose";

export interface IConversationDocument extends Document {
  business_id: string;
  business_name: string;
  business_avatar?: string;
  business_owner_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_message?: string;
  last_message_at?: Date;
  unread_count: number;
  created_at: Date;
  updated_at: Date;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    business_name: {
      type: String,
      required: true,
    },
    business_avatar: {
      type: String,
    },
    business_owner_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_avatar: {
      type: String,
    },
    last_message: {
      type: String,
    },
    last_message_at: {
      type: Date,
    },
    unread_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "conversations",
  }
);

// Compound indexes for efficient queries
ConversationSchema.index({ user_id: 1, business_id: 1 }, { unique: true });
ConversationSchema.index({ user_id: 1, last_message_at: -1 });
ConversationSchema.index({ business_id: 1, last_message_at: -1 });

export const ConversationModel = mongoose.model<IConversationDocument>(
  "Conversation",
  ConversationSchema
);
