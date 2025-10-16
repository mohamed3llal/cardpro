import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { ConversationModel } from "@infrastructure/database/models/ConversationModel";
import { MessageModel } from "@infrastructure/database/models/MessageModel";
import { NotificationSettingsModel } from "@infrastructure/database/models/NotificationSettingsModel";

export class MessagingRepository implements IMessagingRepository {
  async getConversations(userId, filter, page, limit) {
    const skip = (page - 1) * limit;
    const query: any = { user_id: userId };

    if (filter === "unread") query.unread_count = { $gt: 0 };
    else if (filter === "archived") query.is_archived = true;
    else query.is_archived = false;

    const [conversations, total] = await Promise.all([
      ConversationModel.find(query)
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limit),
      ConversationModel.countDocuments(query),
    ]);

    return { conversations, total };
  }

  async getConversationById(id) {
    return ConversationModel.findById(id);
  }

  async startConversation(userId, businessId, initialMessage) {
    let conversation = await ConversationModel.findOne({
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

    return { conversation, message };
  }

  async archiveConversation(id, userId, isArchived) {
    const conversation = await ConversationModel.findById(id);
    if (!conversation || conversation.user_id !== userId)
      throw new Error("FORBIDDEN");
    conversation.is_archived = isArchived;
    await conversation.save();
    return conversation;
  }

  async getMessages(conversationId, userId, page, limit) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      MessageModel.find({ conversation_id: conversationId, is_deleted: false })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      MessageModel.countDocuments({
        conversation_id: conversationId,
        is_deleted: false,
      }),
    ]);
    return { messages, total };
  }

  async sendMessage(conversationId, senderId, content, type, attachments) {
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
    });
    return message;
  }

  async getUnreadCount(userId) {
    const unreadConversations = await ConversationModel.find({
      user_id: userId,
      unread_count: { $gt: 0 },
    });
    const totalUnread = unreadConversations.reduce(
      (sum, c) => sum + c.unread_count,
      0
    );
    return {
      unread_count: totalUnread,
      conversations_with_unread: unreadConversations.length,
    };
  }

  async updateNotificationSettings(userId, data) {
    let settings = await NotificationSettingsModel.findOne({ user_id: userId });
    if (!settings)
      settings = new NotificationSettingsModel({ user_id: userId });
    Object.assign(settings, data);
    await settings.save();
    return settings;
  }
}
