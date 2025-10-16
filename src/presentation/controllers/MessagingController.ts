import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { GetConversationsUseCase } from "@application/use-cases/messaging/GetConversations";
import { StartConversationUseCase } from "@application/use-cases/messaging/StartConversation";
import { SendMessageUseCase } from "@application/use-cases/messaging/SendMessage";
import { GetMessagesUseCase } from "@application/use-cases/messaging/GetMessages";
import { IMessagingRepository } from "@domain/interfaces/IMessagingRepository";
import { logger } from "@config/logger";

export class MessagingController {
  constructor(
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly startConversationUseCase: StartConversationUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly messagingRepository: IMessagingRepository
  ) {}

  /**
   * GET /api/v1/messages/conversations
   */
  async getConversations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { page = 1, limit = 20, filter = "all" } = req.query;

      const result = await this.getConversationsUseCase.execute({
        userId,
        filter: filter as any,
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 100),
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error fetching conversations:", error);
      next(error);
    }
  }

  /**
   * GET /api/v1/messages/conversations/:id
   */
  async getConversationById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const conversation: any =
        await this.messagingRepository.getConversationById(id);

      if (!conversation) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "Conversation not found",
        });
        return;
      }

      // Authorization check
      if (
        conversation.user_id !== userId &&
        conversation.other_participant_id !== userId
      ) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "Access denied",
        });
        return;
      }

      res.status(200).json({ conversation });
    } catch (error) {
      logger.error("Error fetching conversation:", error);
      next(error);
    }
  }

  /**
   * POST /api/v1/messages/conversations
   */
  async startConversation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { business_id, initial_message } = req.body;

      const result = await this.startConversationUseCase.execute({
        userId,
        businessId: business_id,
        initialMessage: initial_message,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error starting conversation:", error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/messages/conversations/:id/archive
   */
  async archiveConversation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { is_archived } = req.body;

      const conversation = await this.messagingRepository.archiveConversation(
        id,
        userId,
        is_archived
      );

      res.status(200).json({
        success: true,
        data: { conversation },
      });
    } catch (error) {
      logger.error("Error archiving conversation:", error);
      next(error);
    }
  }

  /**
   * GET /api/v1/messages/conversations/:conversationId/messages
   */
  async getMessages(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await this.getMessagesUseCase.execute({
        conversationId,
        userId,
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 100),
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error fetching messages:", error);
      next(error);
    }
  }

  /**
   * POST /api/v1/messages/conversations/:conversationId/messages
   */
  async sendMessage(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params;
      const { content, type = "text", attachments = [] } = req.body;

      const message = await this.sendMessageUseCase.execute({
        conversationId,
        senderId: userId,
        content,
        type,
        attachments,
      });

      res.status(201).json({
        success: true,
        data: { message },
      });
    } catch (error) {
      logger.error("Error sending message:", error);
      next(error);
    }
  }

  /**
   * GET /api/v1/messages/unread-count
   */
  async getUnreadCount(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const result = await this.messagingRepository.getUnreadCount(userId);
      res.status(200).json(result);
    } catch (error) {
      logger.error("Error getting unread count:", error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/messages/notifications
   */
  async updateNotificationSettings(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const data = req.body;

      const settings =
        await this.messagingRepository.updateNotificationSettings(userId, data);

      res.status(200).json({
        success: true,
        data: { settings },
      });
    } catch (error) {
      logger.error("Error updating notification settings:", error);
      next(error);
    }
  }
}
