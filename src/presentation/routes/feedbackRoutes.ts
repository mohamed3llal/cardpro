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
) => {
  const router = Router();
  const auth = authMiddleware(authService);

  // All admin routes require authentication and admin privileges
  router.use(auth);
  router.use(adminMiddleware);

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/admin/feedbacks/pending
   * Get all pending feedbacks
   */
  router.get("/pending", feedbackController.getPendingFeedbacks);

  /**
   * GET /api/v1/admin/feedbacks
   * Get all feedbacks with optional status filter
   */
  router.get("/", feedbackController.getAllFeedbacks);

  /**
   * POST /api/v1/admin/feedbacks
   * Submit a new feedback
   */
  router.post(
    "/",
    feedbackRateLimit,
    validate(submitFeedbackSchema),
    feedbackController.submitFeedback
  );

  /**
   * PUT /api/v1/admin/feedbacks/:feedbackId/status
   * Update the status of a feedback
   */
  router.put(
    "/:feedbackId/status",
    validate(updateFeedbackStatusSchema),
    feedbackController.updateFeedbackStatus
  );

  return router;
};
