import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { ConversationModel } from "@infrastructure/database/models/ConversationModel";
import { MessageModel } from "@infrastructure/database/models/MessageModel";
import { NotificationSettingsModel } from "@infrastructure/database/models/NotificationSettingsModel";

import {
  Conversation,
  Message,
  NotificationSettings,
} from "@domain/entities/Messaging";

export class MessagingRepository implements IMessagingRepository {
  async getConversations(
    userId: string,
    filter: any,
    page: number,
    limit: number
  ): Promise<{ conversations: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = { user_id: userId };

    if (filter === "unread") query.unread_count = { $gt: 0 };
    else if (filter === "archived") query.is_archived = true;
    else query.is_archived = false;

    const [conversations, total] = await Promise.all([
      ConversationModel.find(query)
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ConversationModel.countDocuments(query),
    ]);

    return { conversations, total };
  }

  async getConversationById(id: string): Promise<any | null> {
    return ConversationModel.findById(id).lean();
  }

  async startConversation(
    userId: string,
    businessId: string,
    initialMessage: string
  ): Promise<{ conversation: any; message: any }> {
    let conversation: any = await ConversationModel.findOne({
      user_id: userId,
      business_id: businessId,
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        user_id: userId,
        business_id: businessId,
        unread_count: 0,
        is_archived: false,
      });
    }

    const message = await MessageModel.create({
      conversation_id: conversation._id,
      sender_id: userId,
      content: initialMessage,
      type: "text",
      attachments: [],
      is_read: false,
    });

    conversation.last_message_id = message._id;
    await conversation.save();

    return {
      conversation: conversation.toObject(),
      message: message.toObject(),
    };
  }

  async archiveConversation(
    id: string,
    userId: string,
    isArchived: boolean
  ): Promise<any> {
    const conversation = await ConversationModel.findById(id);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.user_id.toString() !== userId)
      throw new Error("FORBIDDEN");

    conversation.is_archived = isArchived;
    await conversation.save();

    return conversation.toObject();
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page: number,
    limit: number
  ): Promise<{ messages: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      MessageModel.find({ conversation_id: conversationId, is_deleted: false })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MessageModel.countDocuments({
        conversation_id: conversationId,
        is_deleted: false,
      }),
    ]);

    return {
      messages: messages.reverse(), // keep chronological order
      total,
    };
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: string,
    attachments: any[]
  ): Promise<any> {
    const message = await MessageModel.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      type,
      attachments,
      is_read: false,
    });

    await ConversationModel.findByIdAndUpdate(conversationId, {
      last_message_id: message._id,
      updated_at: new Date(),
    });

    return message.toObject();
  }

  async getUnreadCount(
    userId: string
  ): Promise<{ unread_count: number; conversations_with_unread: number }> {
    const unreadConversations = await ConversationModel.find({
      user_id: userId,
      unread_count: { $gt: 0 },
    }).lean();

    const totalUnread = unreadConversations.reduce(
      (sum, c) => sum + (c.unread_count || 0),
      0
    );

    return {
      unread_count: totalUnread,
      conversations_with_unread: unreadConversations.length,
    };
  }

  async updateNotificationSettings(
    userId: string,
    data: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    let settings = await NotificationSettingsModel.findOne({ user_id: userId });

    if (!settings) {
      settings = new NotificationSettingsModel({ user_id: userId });
    }

    Object.assign(settings, data);
    await settings.save();

    return settings.toObject();
  }
}
