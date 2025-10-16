// src/presentation/controllers/MessagingController.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { logger } from "@config/logger";
import { ConversationModel } from "@infrastructure/database/models/ConversationModel";
import { MessageModel } from "@infrastructure/database/models/MessageModel";
import { NotificationSettingsModel } from "@infrastructure/database/models/NotificationSettingsModel";

export class MessagingController {
  /**
   * GET /api/v1/messages/conversations
   * Get user conversations with pagination
   */
  async getConversations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const { page = 1, limit = 20, filter = "all" } = req.query;
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(parseInt(limit as string) || 20, 100);
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const query: any = { user_id: userId };
      if (filter === "unread") {
        query.unread_count = { $gt: 0 };
      } else if (filter === "archived") {
        query.is_archived = true;
      } else {
        query.is_archived = false; // Default: show active conversations
      }

      logger.info(
        `Fetching conversations for user: ${userId}, filter: ${filter}`
      );

      const [conversations, total] = await Promise.all([
        ConversationModel.find(query)
          .sort({ updated_at: -1 })
          .skip(skip)
          .limit(limitNum),
        ConversationModel.countDocuments(query),
      ]);

      // Enrich conversations with business and message details
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv: any) => {
          const lastMessage: any = conv.last_message_id
            ? await MessageModel.findById(conv.last_message_id)
            : null;

          return {
            id: conv._id.toString(),
            business_id: conv.business_id,
            participant_id: conv.other_participant_id,
            last_message: lastMessage
              ? {
                  id: lastMessage._id.toString(),
                  content: lastMessage.content,
                  sender_id: lastMessage.sender_id,
                  timestamp: lastMessage.created_at?.toISOString(),
                  is_read: lastMessage.is_read,
                }
              : null,
            unread_count: conv.unread_count,
            is_archived: conv.is_archived,
            created_at: conv.created_at?.toISOString(),
            updated_at: conv.updated_at?.toISOString(),
          };
        })
      );

      res.status(200).json({
        conversations: enrichedConversations,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(total / limitNum),
          total_conversations: total,
          limit: limitNum,
          has_next: pageNum * limitNum < total,
          has_prev: pageNum > 1,
        },
      });
    } catch (error) {
      logger.error("Error fetching conversations:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch conversations",
      });
    }
  }

  /**
   * GET /api/v1/messages/conversations/:id
   * Get specific conversation details
   */
  async getConversationById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const { id } = req.params;

      const conversation = await ConversationModel.findById(id);

      if (!conversation) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "Conversation not found",
        });
        return;
      }

      // Check authorization
      if (
        conversation.user_id !== userId &&
        conversation.other_participant_id !== userId
      ) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
        return;
      }

      const messageCount: any = await MessageModel.countDocuments({
        conversation_id: id,
        is_deleted: false,
      });

      res.status(200).json({
        id: conversation._id,
        business_id: conversation.business_id,
        participant_id: conversation.other_participant_id,
        messages_count: messageCount,
        unread_count: conversation.unread_count,
        is_archived: conversation.is_archived,
        created_at: conversation.created_at?.toISOString(),
        updated_at: conversation.updated_at?.toISOString(),
      });
    } catch (error) {
      logger.error("Error fetching conversation:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch conversation",
      });
    }
  }

  /**
   * POST /api/v1/messages/conversations
   * Start new conversation with business
   */
  async startConversation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const { business_id, initial_message } = req.body;

      // Validation
      if (!business_id || !initial_message) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "business_id and initial_message are required",
        });
        return;
      }

      if (initial_message.length === 0 || initial_message.length > 1000) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "initial_message must be between 1 and 1000 characters",
        });
        return;
      }

      logger.info(
        `Starting conversation between user: ${userId} and business: ${business_id}`
      );

      // Find or create conversation
      let conversation = await ConversationModel.findOne({
        user_id: userId,
        business_id: business_id,
      });

      if (!conversation) {
        conversation = await ConversationModel.create({
          business_id,
          user_id: userId,
          unread_count: 0,
          is_archived: false,
        });
      }

      // Create initial message
      const message: any = await MessageModel.create({
        conversation_id: conversation._id,
        sender_id: userId,
        content: initial_message,
        type: "text",
        attachments: [],
        is_read: false,
      });

      // Update conversation's last message
      conversation.last_message_id = message._id;
      await conversation.save();

      res.status(201).json({
        success: true,
        data: {
          conversation_id: conversation._id,
          message_id: message._id,
          created_at: conversation.created_at?.toISOString(),
        },
        message: "Conversation started successfully",
      });
    } catch (error) {
      logger.error("Error starting conversation:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to start conversation",
      });
    }
  }

  /**
   * PUT /api/v1/messages/conversations/:id/archive
   * Archive or unarchive conversation
   */
  async archiveConversation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const { id } = req.params;
      const { is_archived } = req.body;

      const conversation = await ConversationModel.findById(id);

      if (!conversation) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "Conversation not found",
        });
        return;
      }

      if (conversation.user_id !== userId) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "You don't have permission to modify this conversation",
        });
        return;
      }

      conversation.is_archived = is_archived;
      await conversation.save();

      res.status(200).json({
        success: true,
        data: {
          id: conversation._id,
          is_archived: conversation.is_archived,
        },
      });
    } catch (error) {
      logger.error("Error archiving conversation:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to archive conversation",
      });
    }
  }

  /**
   * GET /api/v1/messages/conversations/:conversationId/messages
   * Get messages in conversation
   */
  async getMessages(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const skip = (pageNum - 1) * limitNum;

      // Verify user is in conversation
      const conversation = await ConversationModel.findById(conversationId);

      if (!conversation) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "Conversation not found",
        });
        return;
      }

      if (
        conversation.user_id !== userId &&
        conversation.other_participant_id !== userId
      ) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
        return;
      }

      const [messages, total] = await Promise.all([
        MessageModel.find({
          conversation_id: conversationId,
          is_deleted: false,
        })
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limitNum),
        MessageModel.countDocuments({
          conversation_id: conversationId,
          is_deleted: false,
        }),
      ]);

      // Mark messages as read
      await MessageModel.updateMany(
        {
          conversation_id: conversationId,
          sender_id: { $ne: userId },
          is_read: false,
        },
        {
          is_read: true,
          read_at: new Date(),
        }
      );

      // Update conversation unread count
      conversation.unread_count = 0;
      await conversation.save();

      const enrichedMessages = messages.map((msg) => ({
        id: msg._id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        type: msg.type,
        attachments: msg.attachments || [],
        is_read: msg.is_read,
        read_at: msg.read_at?.toISOString(),
        created_at: msg.created_at?.toISOString(),
        updated_at: msg.updated_at?.toISOString(),
      }));

      res.status(200).json({
        messages: enrichedMessages,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(total / limitNum),
          total_messages: total,
          limit: limitNum,
          has_next: pageNum * limitNum < total,
          has_prev: pageNum > 1,
        },
      });
    } catch (error) {
      logger.error("Error fetching messages:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to fetch messages",
      });
    }
  }

  /**
   * POST /api/v1/messages/conversations/:conversationId/messages
   * Send message in conversation
   */
  async sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const { conversationId } = req.params;
      const { content, type = "text", attachments = [] } = req.body;

      // Validation
      if (!content || content.trim().length === 0 || content.length > 2000) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message:
            "content is required and must be between 1 and 2000 characters",
        });
        return;
      }

      // Verify conversation exists and user is participant
      const conversation: any = await ConversationModel.findById(
        conversationId
      );

      if (!conversation) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "Conversation not found",
        });
        return;
      }

      if (
        conversation.user_id !== userId &&
        conversation.other_participant_id !== userId
      ) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
        return;
      }

      logger.info(
        `Sending message in conversation: ${conversationId} from user: ${userId}`
      );

      // Create message
      const message = await MessageModel.create({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        type,
        attachments: attachments || [],
        is_read: false,
      });

      // Update conversation
      conversation.last_message_id = message._id;
      await conversation.save();

      res.status(201).json({
        success: true,
        data: {
          id: message._id,
          conversation_id: message.conversation_id,
          content: message.content,
          sender_id: message.sender_id,
          type: message.type,
          attachments: message.attachments,
          created_at: message.created_at?.toISOString(),
        },
        message: "Message sent successfully",
      });
    } catch (error) {
      logger.error("Error sending message:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to send message",
      });
    }
  }

  /**
   * GET /api/v1/messages/unread-count
   * Get unread messages count
   */
  async getUnreadCount(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const unreadConversations = await ConversationModel.find({
        user_id: userId,
        unread_count: { $gt: 0 },
      });

      const totalUnread = unreadConversations.reduce(
        (sum, conv) => sum + conv.unread_count,
        0
      );

      res.status(200).json({
        unread_count: totalUnread,
        conversations_with_unread: unreadConversations.length,
      });
    } catch (error) {
      logger.error("Error getting unread count:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to get unread count",
      });
    }
  }

  /**
   * PUT /api/v1/messages/notifications
   * Update notification settings
   */
  async updateNotificationSettings(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
        return;
      }

      const { email_notifications, push_notifications, mute_until } = req.body;

      let settings = await NotificationSettingsModel.findOne({
        user_id: userId,
      });

      if (!settings) {
        settings = new NotificationSettingsModel({ user_id: userId });
      }

      if (email_notifications !== undefined)
        settings.email_notifications = email_notifications;
      if (push_notifications !== undefined)
        settings.push_notifications = push_notifications;
      if (mute_until !== undefined)
        settings.mute_until = mute_until ? new Date(mute_until) : undefined;

      await settings.save();

      res.status(200).json({
        success: true,
        data: {
          email_notifications: settings.email_notifications,
          push_notifications: settings.push_notifications,
          mute_until: settings.mute_until?.toISOString(),
        },
      });
    } catch (error) {
      logger.error("Error updating notification settings:", error);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Failed to update notification settings",
      });
    }
  }
}
