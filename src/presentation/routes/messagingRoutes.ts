// src/presentation/routes/messagingRoutes.ts

import { Router } from "express";
import { MessagingController } from "@presentation/controllers/MessagingController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { messagingLimiter } from "@infrastructure/middleware/rateLimiter";

export const createMessagingRoutes = (
  messagingController: MessagingController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  // All routes require authentication
  router.use(auth);

  // ============================================
  // Conversation Endpoints
  // ============================================

  /**
   * GET /api/v1/conversations
   * Get all conversations for authenticated user
   */
  router.get("/conversations", messagingController.getAllConversations);

  /**
   * GET /api/v1/conversations/:conversationId
   * Get single conversation details
   */
  router.get(
    "/conversations/:conversationId",
    messagingController.getConversationById
  );

  /**
   * POST /api/v1/conversations
   * Create new conversation with a business
   */
  router.post("/conversations", messagingController.createConversation);

  /**
   * DELETE /api/v1/conversations/:conversationId
   * Delete a conversation and all its messages
   */
  router.delete(
    "/conversations/:conversationId",
    messagingController.deleteConversation
  );

  /**
   * PUT /api/v1/conversations/:conversationId/read
   * Mark all messages in conversation as read
   */
  router.put(
    "/conversations/:conversationId/read",
    messagingController.markAsRead
  );

  // ============================================
  // Message Endpoints
  // ============================================

  /**
   * GET /api/v1/conversations/:conversationId/messages
   * Get all messages in a conversation
   */
  router.get(
    "/conversations/:conversationId/messages",
    messagingController.getMessages
  );

  /**
   * POST /api/v1/messages
   * Send a new message in a conversation
   */
  router.post("/messages", messagingLimiter, messagingController.sendMessage);

  return router;
};
