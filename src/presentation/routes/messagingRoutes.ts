// src/presentation/routes/messagingRoutes.ts
import { Router } from "express";
import { MessagingController } from "../controllers/MessagingController";
import { authMiddleware } from "../../infrastructure/middleware/authMiddleware";
import { validate } from "../../infrastructure/middleware/validator";
import { messagingValidator } from "../validators/messagingValidator";
import { rateLimiter } from "../../infrastructure/middleware/rateLimiter";
import { IAuthService } from "@domain/interfaces/IAuthServices";

export const createMessagingRoutes = (
  controller: MessagingController,
  authService: IAuthService
): Router => {
  const router = Router();

  // Apply authentication to all routes
  const auth = authMiddleware(authService);

  // Conversations
  router.post(
    "/",
    auth,
    validate(messagingValidator.createConversation),
    controller.createConversation
  );

  router.get(
    "/",
    auth,
    validate(messagingValidator.pagination),
    controller.getAllConversations
  );

  router.get(
    "/:conversationId",
    auth,
    validate(messagingValidator.conversationId),
    controller.getConversationById
  );

  router.delete(
    "/:conversationId",
    auth,
    validate(messagingValidator.conversationId),
    controller.removeConversation
  );

  // Messages
  router.get(
    "/:conversationId/messages",
    auth,
    validate(messagingValidator.getMessages),
    controller.getConversationMessages
  );

  router.post(
    "/messages",
    auth,
    rateLimiter.messaging, // Rate limit: 60 messages per minute
    validate(messagingValidator.sendMessage),
    controller.sendNewMessage
  );

  router.put(
    "/:conversationId/read",
    auth,
    validate(messagingValidator.conversationId),
    controller.markAsRead
  );

  return router;
};
