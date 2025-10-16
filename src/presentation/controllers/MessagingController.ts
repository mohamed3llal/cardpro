import { Request, Response } from "express";
import { StartConversation } from "../../application/use-cases/messaging/StartConversation";
import { GetConversations } from "../../application/use-cases/messaging/GetConversations";
import { GetMessages } from "../../application/use-cases/messaging/GetMessages";
import { SendMessage } from "../../application/use-cases/messaging/SendMessage";
import { MarkMessagesAsRead } from "../../application/use-cases/messaging/MarkMessagesAsRead";
import { DeleteConversation } from "../../application/use-cases/messaging/DeleteConversation";
import { ResponseHandler } from "../../shared/utils/ResponseHandler";
import { AppError } from "../../shared/errors/AppError";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";

export class MessagingController {
  constructor(
    private startConversation: StartConversation,
    private getConversations: GetConversations,
    private getMessages: GetMessages,
    private sendMessage: SendMessage,
    private markMessagesAsRead: MarkMessagesAsRead,
    private deleteConversation: DeleteConversation
  ) {}

  // POST /api/v1/conversations
  createConversation = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const conversation = await this.startConversation.execute(
        userId,
        req.body
      );

      ResponseHandler.created(res, {
        conversation: conversation.toDTO(),
      });
    } catch (error: any | AppError) {
      ResponseHandler.error(res, error);
    }
  };

  // GET /api/v1/conversations
  getAllConversations = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      console.log(page, limit, userId);
      const result = await this.getConversations.execute(userId, {
        page,
        limit,
      });

      console.log(res, {
        conversations: result.data.map((c) => c.toDTO()),
        pagination: result.pagination,
      });

      ResponseHandler.success(res, {
        conversations: result.data.map((c) => c.toDTO()),
        pagination: result.pagination,
      });
    } catch (error: any | AppError) {
      ResponseHandler.error(res, error);
    }
  };

  // GET /api/v1/conversations/:conversationId
  getConversationById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { conversationId } = req.params;

      // This would need a new use case, but for now:
      const conversation = await this.getConversations.execute(userId, {
        page: 1,
        limit: 1,
      });
      const found = conversation.data.find((c) => c.id === conversationId);

      if (!found) {
        throw new AppError("Conversation not found", 404);
      }

      ResponseHandler.success(res, {
        conversation: found.toDTO(),
      });
    } catch (error: any | AppError) {
      ResponseHandler.error(res, error);
    }
  };

  // DELETE /api/v1/conversations/:conversationId
  removeConversation = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { conversationId } = req.params;

      await this.deleteConversation.execute(userId, conversationId);

      ResponseHandler.noContent(res);
    } catch (error: any | AppError) {
      ResponseHandler.error(res, error);
    }
  };

  // GET /api/v1/conversations/:conversationId/messages
  getConversationMessages = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const result = await this.getMessages.execute(userId, conversationId, {
        page,
        limit,
      });

      ResponseHandler.success(res, {
        messages: result.data.map((m: any) => m.toDTO()),
        pagination: result.pagination,
      });
    } catch (error: any | AppError) {
      ResponseHandler.error(res, error);
    }
  };

  // POST /api/v1/messages
  sendNewMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const userName =
        req.userEmail?.slice(0, req.userEmail.indexOf("@")) || "";
      const userAvatar = "";

      if (!userId || !userName) {
        throw new AppError("Unauthorized", 401);
      }

      const message = await this.sendMessage.execute(
        userId,
        userName,
        userAvatar,
        req.body
      );

      ResponseHandler.created(res, {
        message: message.toDTO(),
      });
    } catch (error: any | AppError) {
      ResponseHandler.error(res, error);
    }
  };

  // PUT /api/v1/conversations/:conversationId/read
  markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { conversationId } = req.params;

      await this.markMessagesAsRead.execute(userId, conversationId);

      ResponseHandler.noContent(res);
    } catch (error: any | AppError) {
      ResponseHandler.error(res, error);
    }
  };
}
