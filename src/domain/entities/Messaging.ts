// src/domain/entities/Message.ts
import { Types } from "mongoose";

export interface IMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  read: boolean;
  created_at: Date;
  updated_at?: Date;
}

export class Message {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly content: string,
    public readonly read: boolean = false,
    public readonly senderAvatar?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt?: Date
  ) {}

  static create(data: {
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    senderAvatar?: string;
  }): Message {
    return new Message(
      new Types.ObjectId().toString(),
      data.conversationId,
      data.senderId,
      data.senderName,
      data.content,
      false,
      data.senderAvatar,
      new Date()
    );
  }

  markAsRead(): Message {
    return new Message(
      this.id,
      this.conversationId,
      this.senderId,
      this.senderName,
      this.content,
      true,
      this.senderAvatar,
      this.createdAt,
      new Date()
    );
  }

  toDTO(): IMessage {
    return {
      id: this.id,
      conversation_id: this.conversationId,
      sender_id: this.senderId,
      sender_name: this.senderName,
      sender_avatar: this.senderAvatar,
      content: this.content,
      read: this.read,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
