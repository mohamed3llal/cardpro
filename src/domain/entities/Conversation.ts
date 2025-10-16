// src/domain/entities/Conversation.ts
import { Types } from "mongoose";

export interface IConversation {
  id: string;
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

export class Conversation {
  constructor(
    public readonly id: string,
    public readonly businessId: string,
    public readonly businessName: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly lastMessage?: string,
    public readonly lastMessageAt?: Date,
    public readonly unreadCount: number = 0,
    public readonly businessAvatar?: string,
    public readonly userAvatar?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt?: Date
  ) {}

  static create(data: {
    businessId: string;
    businessName: string;
    userId: string;
    userName: string;
    businessAvatar?: string;
    userAvatar?: string;
  }): Conversation {
    return new Conversation(
      new Types.ObjectId().toString(),
      data.businessId,
      data.businessName,
      data.userId,
      data.userName,
      undefined,
      undefined,
      0,
      data.businessAvatar,
      data.userAvatar,
      new Date()
    );
  }

  updateLastMessage(message: string, timestamp: Date): Conversation {
    return new Conversation(
      this.id,
      this.businessId,
      this.businessName,
      this.userId,
      this.userName,
      message,
      timestamp,
      this.unreadCount,
      this.businessAvatar,
      this.userAvatar,
      this.createdAt,
      new Date()
    );
  }

  incrementUnreadCount(): Conversation {
    return new Conversation(
      this.id,
      this.businessId,
      this.businessName,
      this.userId,
      this.userName,
      this.lastMessage,
      this.lastMessageAt,
      this.unreadCount + 1,
      this.businessAvatar,
      this.userAvatar,
      this.createdAt,
      new Date()
    );
  }

  resetUnreadCount(): Conversation {
    return new Conversation(
      this.id,
      this.businessId,
      this.businessName,
      this.userId,
      this.userName,
      this.lastMessage,
      this.lastMessageAt,
      0,
      this.businessAvatar,
      this.userAvatar,
      this.createdAt,
      new Date()
    );
  }

  toDTO(): IConversation {
    return {
      id: this.id,
      business_id: this.businessId,
      business_name: this.businessName,
      business_avatar: this.businessAvatar,
      user_id: this.userId,
      user_name: this.userName,
      user_avatar: this.userAvatar,
      last_message: this.lastMessage,
      last_message_at: this.lastMessageAt,
      unread_count: this.unreadCount,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
