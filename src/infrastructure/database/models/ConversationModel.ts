import mongoose, { Schema, Document } from "mongoose";

export interface IConversationDocument extends Document {
  business_id: string;
  user_id: string;
  other_participant_id?: string;
  last_message_id?: string;
  unread_count: number;
  is_archived: boolean;
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
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    other_participant_id: {
      type: String,
      index: true,
    },
    last_message_id: String,
    unread_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Ensure unique conversation per business-user pair
ConversationSchema.index({ business_id: 1, user_id: 1 }, { unique: true });

export const ConversationModel = mongoose.model<IConversationDocument>(
  "Conversation",
  ConversationSchema
);
