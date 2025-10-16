import mongoose, { Document, Schema } from "mongoose";

export interface IMessageDocument extends Document {
  conversation_id: string;
  sender_id: string;
  content: string;
  type: "text" | "image" | "file" | "location";
  attachments: Array<{
    type: string;
    url: string;
    thumbnail?: string;
    filename?: string;
    size?: number;
  }>;
  is_read: boolean;
  read_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
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
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "location"],
      default: "text",
    },
    attachments: {
      type: [
        {
          type: String,
          url: String,
          thumbnail: String,
          filename: String,
          size: Number,
        },
      ],
      default: [],
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
    read_at: Date,
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: Date,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for queries
MessageSchema.index({ conversation_id: 1, created_at: -1 });
MessageSchema.index({ sender_id: 1, created_at: -1 });
MessageSchema.index({ conversation_id: 1, is_read: 1 });

export const MessageModel = mongoose.model<IMessageDocument>(
  "Message",
  MessageSchema
);
