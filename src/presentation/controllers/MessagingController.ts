import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { MessagingRepository } from "@infrastructure/database/repositories/MessagingRepository";
import { Message } from "@domain/entities/Messaging";
import { logger } from "@config/logger";
import { CardModel } from "@infrastructure/database/models/CardModel";
import { UserModel } from "@infrastructure/database/models/UserModel";

export class MessagingController {
  constructor(private readonly messagingRepository: MessagingRepository) {}

  /**
   * GET /api/v1/conversations
   * Get all conversations for authenticated user
   */
  getAllConversations = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const result = await this.messagingRepository.getConversationsByUserId(
        userId,
        { page, limit }
      );

      res.status(200).json({
        conversations: result.data.map((c: Message) => c.toJSON()),
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error("Error fetching conversations:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/conversations/:conversationId
   * Get single conversation by ID
   */
  getConversationById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const conversation = await this.messagingRepository.getConversationById(
        conversationId
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      // Check if user is part of conversation
      if (conversation.userId !== userId) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      res.status(200).json({
        conversation: conversation.toJSON(),
      });
    } catch (error) {
      logger.error("Error fetching conversation:", error);
      next(error);
    }
  };

  /**
   * POST /api/v1/conversations
   * Create new conversation with a business
   */
  createConversation = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { business_id, initial_message } = req.body;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!business_id) {
        res.status(400).json({
          success: false,
          message: "Business ID is required",
        });
        return;
      }

      // Check if conversation already exists
      const existingId = await this.messagingRepository.conversationExists(
        userId,
        business_id
      );

      if (existingId) {
        res.status(409).json({
          success: false,
          message: "Conversation already exists with this business",
          conversation_id: existingId,
        });
        return;
      }

      // Get business and user details
      const [business, user] = await Promise.all([
        CardModel.findById(business_id),
        UserModel.findById(userId),
      ]);

      if (!business) {
        res.status(404).json({
          success: false,
          message: "Business not found",
        });
        return;
      }

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const conversation = await this.messagingRepository.createConversation(
        userId,
        business_id,
        initial_message
      );

      res.status(201).json({
        conversation: conversation.toJSON(),
      });
    } catch (error) {
      logger.error("Error creating conversation:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/conversations/:conversationId/messages
   * Get all messages in a conversation
   */
  getMessages = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Verify user access to conversation
      const conversation = await this.messagingRepository.getConversationById(
        conversationId
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      if (
        conversation.userId !== userId &&
        conversation.businessOwnerId !== userId
      ) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      const result = await this.messagingRepository.getMessagesByConversationId(
        conversationId,
        { page, limit }
      );

      res.status(200).json({
        messages: result.data.map((m: Message) => m.toJSON()),
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error("Error fetching messages:", error);
      next(error);
    }
  };

  /**
   * POST /api/v1/messages
   * Send a new message
   */
  sendMessage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { conversation_id, content } = req.body;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!conversation_id || !content) {
        res.status(400).json({
          success: false,
          message: "conversation_id and content are required",
        });
        return;
      }

      // Verify conversation exists and user has access
      const conversation = await this.messagingRepository.getConversationById(
        conversation_id
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      if (
        conversation.userId !== userId &&
        conversation.businessOwnerId !== userId
      ) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      // Get sender details
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Create message
      const message = Message.create({
        conversation_id,
        sender_id: userId,
        sender_name: `${user.firstName} ${user.lastName}`,
        sender_avatar: user.avatar,
        content: content.trim(),
        read: false,
      });

      const savedMessage = await this.messagingRepository.createMessage(
        message
      );

      // Update conversation
      await this.messagingRepository.updateConversation(
        conversation_id,
        content.trim(),
        new Date()
      );

      // Increment unread count for recipient
      await this.messagingRepository.incrementUnreadCount(
        conversation_id,
        userId
      );

      res.status(201).json({
        message: savedMessage.toJSON(),
      });
    } catch (error: any) {
      if (error.message?.includes("Message content")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      logger.error("Error sending message:", error);
      next(error);
    }
  };

  /**
   * PUT /api/v1/conversations/:conversationId/read
   * Mark messages as read
   */
  markAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Verify conversation exists and user has access
      const conversation = await this.messagingRepository.getConversationById(
        conversationId
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      if (
        conversation.userId !== userId &&
        conversation.businessOwnerId !== userId
      ) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      const markedCount = await this.messagingRepository.markMessagesAsRead(
        conversationId,
        userId
      );

      await this.messagingRepository.resetUnreadCount(conversationId, userId);

      res.status(200).json({
        success: true,
        message: "Messages marked as read",
        marked_count: markedCount,
      });
    } catch (error) {
      logger.error("Error marking messages as read:", error);
      next(error);
    }
  };

  /**
   * DELETE /api/v1/conversations/:conversationId
   * Delete a conversation
   */
  deleteConversation = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Verify conversation exists and user has access
      const conversation = await this.messagingRepository.getConversationById(
        conversationId
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }

      if (conversation.userId !== userId) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      // Delete messages first
      await this.messagingRepository.deleteMessagesByConversationId(
        conversationId
      );

      // Delete conversation
      await this.messagingRepository.deleteConversation(conversationId);

      res.status(200).json({
        success: true,
        message: "Conversation deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting conversation:", error);
      next(error);
    }
  };
}
