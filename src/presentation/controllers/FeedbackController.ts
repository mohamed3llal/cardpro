// src/presentation/controllers/FeedbackController.ts

import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { SubmitFeedbackUseCase } from "@application/use-cases/feedback/SubmitFeedback";
import { GetUserFeedbackUseCase } from "@application/use-cases/feedback/GetUserFeedback";
import { GetFeedbackByIdUseCase } from "@application/use-cases/feedback/GetFeedbackById";
import { DeleteFeedbackUseCase } from "@application/use-cases/feedback/DeleteFeedback";
import { GetAllFeedbackUseCase } from "@application/use-cases/feedback/GetAllFeedback";
import { UpdateFeedbackStatusUseCase } from "@application/use-cases/feedback/UpdateFeedbackStatus";
import { logger } from "@config/logger";

export class FeedbackController {
  constructor(
    private submitFeedbackUseCase: SubmitFeedbackUseCase,
    private getUserFeedbackUseCase: GetUserFeedbackUseCase,
    private getFeedbackByIdUseCase: GetFeedbackByIdUseCase,
    private deleteFeedbackUseCase: DeleteFeedbackUseCase,
    private getAllFeedbackUseCase: GetAllFeedbackUseCase,
    private updateFeedbackStatusUseCase: UpdateFeedbackStatusUseCase
  ) {}

  /**
   * POST /api/v1/feedback
   * Submit feedback
   */
  submitFeedback = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const feedback = await this.submitFeedbackUseCase.execute({
        card_id: req.body.card_id,
        user_id: userId,
        feedback_type: req.body.feedback_type,
        subject: req.body.subject,
        message: req.body.message,
        email: req.body.email,
        rating: req.body.rating,
      });

      res.status(201).json({
        feedback: feedback.toJSON(),
        message: "Feedback submitted successfully. Thank you for your input!",
      });
    } catch (error: any) {
      if (error.message?.includes("must be between")) {
        res.status(400).json({
          error: "ValidationError",
          message: error.message,
        });
        return;
      }

      if (error.message === "Business card not found") {
        res.status(404).json({
          error: "NotFoundError",
          message: "Business card not found",
        });
        return;
      }

      logger.error("Error submitting feedback:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/feedback/user
   * Get user's feedback
   */
  getUserFeedback = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const result = await this.getUserFeedbackUseCase.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      logger.error("Error getting user feedback:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/feedback/:feedbackId
   * Get feedback by ID
   */
  getFeedbackById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const isAdmin =
        req.userRole === "admin" || req.userRole === "super_admin";
      const feedback = await this.getFeedbackByIdUseCase.execute(
        req.params.feedbackId,
        userId,
        isAdmin
      );

      res.status(200).json({ feedback });
    } catch (error: any) {
      if (error.message === "Feedback not found") {
        res.status(404).json({
          error: "NotFoundError",
          message: "Feedback not found",
        });
        return;
      }

      if (error.message === "You can only view your own feedback") {
        res.status(403).json({
          error: "Forbidden",
          message: "You can only view your own feedback",
        });
        return;
      }

      logger.error("Error getting feedback:", error);
      next(error);
    }
  };

  /**
   * DELETE /api/v1/feedback/:feedbackId
   * Delete feedback
   */
  deleteFeedback = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      await this.deleteFeedbackUseCase.execute(req.params.feedbackId, userId);

      res.status(200).json({
        message: "Feedback deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Feedback not found") {
        res.status(404).json({
          error: "NotFoundError",
          message: "Feedback not found",
        });
        return;
      }

      if (error.message === "You can only delete your own feedback") {
        res.status(403).json({
          error: "Forbidden",
          message: "You can only delete your own feedback",
        });
        return;
      }

      logger.error("Error deleting feedback:", error);
      next(error);
    }
  };

  /**
   * GET /api/v1/admin/feedback
   * Get all feedback (Admin only)
   */
  getAllFeedback = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const status = req.query.status as string;
      const feedbackType = req.query.feedback_type as string;
      const rating = req.query.rating
        ? parseInt(req.query.rating as string)
        : undefined;

      const result = await this.getAllFeedbackUseCase.execute(page, limit, {
        status: status !== "all" ? status : undefined,
        feedback_type: feedbackType !== "all" ? feedbackType : undefined,
        rating,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error("Error getting all feedback:", error);
      next(error);
    }
  };

  /**
   * PATCH /api/v1/admin/feedback/:feedbackId/status
   * Update feedback status (Admin only)
   */
  updateFeedbackStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.userId;
      if (!adminId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      const feedback = await this.updateFeedbackStatusUseCase.execute(
        req.params.feedbackId,
        adminId,
        {
          status: req.body.status,
          admin_notes: req.body.admin_notes,
        }
      );

      res.status(200).json({
        feedback,
        message: "Feedback status updated successfully",
      });
    } catch (error: any) {
      if (error.message === "Feedback not found") {
        res.status(404).json({
          error: "NotFoundError",
          message: "Feedback not found",
        });
        return;
      }

      logger.error("Error updating feedback status:", error);
      next(error);
    }
  };
}
