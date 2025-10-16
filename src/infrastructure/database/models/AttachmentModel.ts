import mongoose, { Document, Schema } from "mongoose";
export interface IAttachmentDocument extends Document {
  message_id?: string;
  type: "image" | "file" | "document";
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: Date;
}

const AttachmentSchema = new Schema<IAttachmentDocument>(
  {
    message_id: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ["image", "file", "document"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: String,
    filename: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    uploaded_by: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const AttachmentModel = mongoose.model<IAttachmentDocument>(
  "Attachment",
  AttachmentSchema
);
