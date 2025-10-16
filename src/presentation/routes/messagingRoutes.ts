import { Router } from "express";
import { MessagingController } from "../controllers/MessagingController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { rateLimitMiddleware } from "@infrastructure/middleware/rateLimitMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";

export function createMessagingRoutes(
  messagingController: MessagingController,
  authService: IAuthService
): Router {
  const router = Router();
  const auth = authMiddleware(authService);

  // Rate limiters for messaging
  const conversationLimiter = rateLimitMiddleware({
    windowMs: 60000,
    max: 100,
  });

  const messageLimiter = rateLimitMiddleware({
    windowMs: 60000,
    max: 60,
  });

  // ============================================
  // CONVERSATION ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/messages/conversations
   * Get user conversations
   */
  router.get("/conversations", auth, conversationLimiter, (req, res, next) =>
    messagingController.getConversations(req, res, next)
  );

  /**
   * GET /api/v1/messages/conversations/:id
   * Get specific conversation
   */
  router.get(
    "/conversations/:id",
    auth,
    conversationLimiter,
    (req, res, next) => messagingController.getConversationById(req, res, next)
  );

  /**
   * POST /api/v1/messages/conversations
   * Start new conversation
   */
  router.post("/conversations", auth, conversationLimiter, (req, res, next) =>
    messagingController.startConversation(req, res, next)
  );

  /**
   * PUT /api/v1/messages/conversations/:id/archive
   * Archive/unarchive conversation
   */
  router.put(
    "/conversations/:id/archive",
    auth,
    conversationLimiter,
    (req, res, next) => messagingController.archiveConversation(req, res, next)
  );

  // ============================================
  // MESSAGE ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/messages/conversations/:conversationId/messages
   * Get messages in conversation
   */
  router.get(
    "/conversations/:conversationId/messages",
    auth,
    conversationLimiter,
    (req, res, next) => messagingController.getMessages(req, res, next)
  );

  /**
   * POST /api/v1/messages/conversations/:conversationId/messages
   * Send message in conversation
   */
  router.post(
    "/conversations/:conversationId/messages",
    auth,
    messageLimiter,
    (req, res, next) => messagingController.sendMessage(req, res, next)
  );

  // ============================================
  // NOTIFICATION ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/messages/unread-count
   * Get unread messages count
   */
  router.get("/unread-count", auth, conversationLimiter, (req, res, next) =>
    messagingController.getUnreadCount(req, res, next)
  );

  /**
   * PUT /api/v1/messages/notifications
   * Update notification settings
   */
  router.put("/notifications", auth, conversationLimiter, (req, res, next) =>
    messagingController.updateNotificationSettings(req, res, next)
  );

  return router;
}
