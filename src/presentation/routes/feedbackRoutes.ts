// src/presentation/routes/feedbackRoutes.ts

import { Router } from "express";
import { FeedbackController } from "@presentation/controllers/FeedbackController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { adminMiddleware } from "@infrastructure/middleware/adminMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { validate } from "@infrastructure/middleware/validator";
import {
  submitFeedbackSchema,
  updateFeedbackStatusSchema,
  feedbackIdParamSchema,
  getFeedbackQuerySchema,
} from "@presentation/validators/feedbackValidator";
import rateLimit from "express-rate-limit";

const feedbackRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 feedback submissions per hour
  message: "Too many feedback submissions, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const createFeedbackRoutes = (
  feedbackController: FeedbackController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  // ============================================
  // USER ENDPOINTS (Authenticated)
  // ============================================

  /**
   * POST /api/v1/feedback
   * Submit feedback
   */
  router.post(
    "/",
    auth,
    feedbackRateLimit,
    validate(submitFeedbackSchema),
    feedbackController.submitFeedback
  );

  /**
   * GET /api/v1/feedback/user
   * Get user's feedback
   */
  router.get("/user", auth, feedbackController.getUserFeedback);

  /**
   * GET /api/v1/feedback/:feedbackId
   * Get feedback by ID (owner or admin only)
   */
  router.get("/:feedbackId", auth, feedbackController.getFeedbackById);

  /**
   * DELETE /api/v1/feedback/:feedbackId
   * Delete feedback (owner only)
   */
  router.delete("/:feedbackId", auth, feedbackController.deleteFeedback);

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/admin/feedback
   * Get all feedback with filters (Admin only)
   */
  router.get(
    "/admin/all",
    auth,
    adminMiddleware,
    feedbackController.getAllFeedback
  );

  /**
   * PATCH /api/v1/admin/feedback/:feedbackId/status
   * Update feedback status (Admin only)
   */
  router.patch(
    "/admin/:feedbackId/status",
    auth,
    adminMiddleware,
    validate(updateFeedbackStatusSchema),
    feedbackController.updateFeedbackStatus
  );

  return router;
};
