import mongoose, { Schema, Document } from "mongoose";

export interface IConversationDocument extends Document {
  business_id: string;
  business_name: string;
  business_avatar?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_message?: string;
  last_message_at?: Date;
  unread_count: number;
  created_at: Date;
  updated_at?: Date;
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
      default: null,
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
      default: null,
    },
    last_message: {
      type: String,
      default: null,
    },
    last_message_at: {
      type: Date,
      default: null,
    },
    unread_count: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
    collection: "conversations",
  }
);

// Compound indexes
ConversationSchema.index({ user_id: 1, business_id: 1 }, { unique: true });
ConversationSchema.index({ business_id: 1, user_id: 1 });
ConversationSchema.index({ last_message_at: -1 });

export const ConversationModel = mongoose.model<IConversationDocument>(
  "Conversation",
  ConversationSchema
);
