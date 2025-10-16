import { Router } from "express";
import { MessagingController } from "../controllers/MessagingController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { rateLimitMiddleware } from "@infrastructure/middleware/rateLimitMiddleware";
import { validate } from "@infrastructure/middleware/validator";
import {
  startConversationSchema,
  sendMessageSchema,
  archiveConversationSchema,
  updateNotificationSettingsSchema,
} from "../validators/messagingValidator";
import { IAuthService } from "@domain/interfaces/IAuthServices";

export function createNotificationRoutes(
  messagingController: MessagingController,
  authService: IAuthService
): Router {
  const router = Router();
  const auth = authMiddleware(authService);

  const conversationLimiter = rateLimitMiddleware({
    windowMs: 60000,
    max: 100,
  });

  const messageLimiter = rateLimitMiddleware({
    windowMs: 60000,
    max: 60,
  });

  // Notifications
  router.get("/unread-count", auth, conversationLimiter, (req, res, next) =>
    messagingController.getUnreadCount(req, res, next)
  );

  router.put(
    "/notifications",
    auth,
    conversationLimiter,
    validate(updateNotificationSettingsSchema),
    (req, res, next) =>
      messagingController.updateNotificationSettings(req, res, next)
  );

  return router;
}
