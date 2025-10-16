// src/infrastructure/database/models/MessageModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMessageDocument extends Document {
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  read: boolean;
  created_at: Date;
  updated_at?: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    conversation_id: {
      type: String,
      required: true,
      index: true,
    },
    sender_id: {
      type: String,
      required: true,
      index: true,
    },
    sender_name: {
      type: String,
      required: true,
    },
    sender_avatar: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updated_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
    collection: "messages",
  }
);

// Compound indexes for efficient queries
MessageSchema.index({ conversation_id: 1, created_at: -1 });
MessageSchema.index({ conversation_id: 1, read: 1 });

export const MessageModel = mongoose.model<IMessageDocument>(
  "Message",
  MessageSchema
);
