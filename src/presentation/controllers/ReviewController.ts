// src/presentation/controllers/ReviewController.ts

import { Response, NextFunction } from "express";
import { AuthRequest } from "@infrastructure/middleware/authMiddleware";
import { CreateReviewUseCase } from "@application/use-cases/review/CreateReview";
import { GetBusinessReviewsUseCase } from "@application/use-cases/review/GetBusinessReviews";
import { GetUserReviewsUseCase } from "@application/use-cases/review/GetUserReviews";
import { UpdateReviewUseCase } from "@application/use-cases/review/UpdateReview";
import { DeleteReviewUseCase } from "@application/use-cases/review/DeleteReview";
import { MarkReviewHelpfulUseCase } from "@application/use-cases/review/MarkReviewHelpful";
import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { logger } from "@config/logger";

export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getBusinessReviewsUseCase: GetBusinessReviewsUseCase,
    private readonly getUserReviewsUseCase: GetUserReviewsUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly markReviewHelpfulUseCase: MarkReviewHelpfulUseCase,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * GET /api/businesses/:businessId/reviews
   * Get reviews for a business (supports anonymous access)
   */
  getBusinessReviews = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { businessId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await this.getBusinessReviewsUseCase.execute(
        businessId,
        page,
        limit
      );

      res.status(200).json({
        reviews: result.reviews.map((r) => this.formatReviewResponse(r)),
        stats: result.stats,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error("Error getting business reviews:", error);
      next(error);
    }
  };

  /**
   * GET /api/reviews/user
   * Get authenticated user's reviews
   */
  getUserReviews = async (
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

      const result = await this.getUserReviewsUseCase.execute(userId);

      res.status(200).json({
        reviews: result.reviews.map((r) => this.formatReviewResponse(r)),
      });
    } catch (error) {
      logger.error("Error getting user reviews:", error);
      next(error);
    }
  };

  /**
   * POST /api/reviews
   * Create a new review
   */
  createReview = async (
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

      const { business_id, rating, title, comment } = req.body;

      // Validation
      if (!business_id || !rating || !title || !comment) {
        res.status(400).json({
          error: "ValidationError",
          message: "All fields are required",
        });
        return;
      }

      // Get user details
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          error: "NotFoundError",
          message: "User not found",
        });
        return;
      }

      const review = await this.createReviewUseCase.execute(
        {
          user_id: userId,
          business_id,
          rating,
          title,
          comment,
        },
        user.fullName,
        user.avatar
      );

      res.status(201).json({
        review: this.formatReviewResponse(review),
      });
    } catch (error: any) {
      if (error.message === "Business not found") {
        res.status(404).json({
          error: "NotFoundError",
          message: "Business not found",
        });
        return;
      }

      if (error.message === "You have already reviewed this business") {
        res.status(409).json({
          error: "ConflictError",
          message: "You have already reviewed this business",
        });
        return;
      }

      logger.error("Error creating review:", error);
      next(error);
    }
  };

  /**
   * PUT /api/reviews/:reviewId
   * Update a review
   */
  updateReview = async (
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

      const { reviewId } = req.params;
      const { rating, title, comment } = req.body;

      const review = await this.updateReviewUseCase.execute(reviewId, userId, {
        rating,
        title,
        comment,
      });

      res.status(200).json({
        review: this.formatReviewResponse(review),
      });
    } catch (error: any) {
      if (error.message === "Review not found") {
        res.status(404).json({
          error: "NotFoundError",
          message: "Review not found",
        });
        return;
      }

      if (error.message === "You can only edit your own reviews") {
        res.status(403).json({
          error: "Forbidden",
          message: "You can only edit your own reviews",
        });
        return;
      }

      logger.error("Error updating review:", error);
      next(error);
    }
  };

  /**
   * DELETE /api/reviews/:reviewId
   * Delete a review
   */
  deleteReview = async (
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

      const { reviewId } = req.params;
      const isAdmin =
        req.userRole === "admin" || req.userRole === "super_admin";

      await this.deleteReviewUseCase.execute(reviewId, userId, isAdmin);

      res.status(200).json({
        message: "Review deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Review not found") {
        res.status(404).json({
          error: "NotFoundError",
          message: "Review not found",
        });
        return;
      }

      if (error.message === "You can only delete your own reviews") {
        res.status(403).json({
          error: "Forbidden",
          message: "You can only delete your own reviews",
        });
        return;
      }

      logger.error("Error deleting review:", error);
      next(error);
    }
  };

  /**
   * POST /api/reviews/:reviewId/helpful
   * Mark review as helpful
   */
  markAsHelpful = async (
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

      const { reviewId } = req.params;

      const result = await this.markReviewHelpfulUseCase.execute(
        reviewId,
        userId
      );

      res.status(200).json({
        message: "Review marked as helpful",
        helpful_count: result.helpful_count,
      });
    } catch (error: any) {
      if (error.message === "Review not found") {
        res.status(404).json({
          error: "NotFoundError",
          message: "Review not found",
        });
        return;
      }

      if (error.message === "You have already marked this review as helpful") {
        res.status(409).json({
          error: "ConflictError",
          message: "You have already marked this review as helpful",
        });
        return;
      }

      logger.error("Error marking review as helpful:", error);
      next(error);
    }
  };

  /**
   * GET /api/admin/reviews
   * Get all reviews (Admin only)
   */
  getAllReviews = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const status = req.query.status as string;

      // This would be implemented in the use case
      res.status(200).json({
        message: "Admin reviews endpoint",
      });
    } catch (error) {
      logger.error("Error getting all reviews:", error);
      next(error);
    }
  };

  /**
   * Helper method to format review response
   */
  private formatReviewResponse(review: any): any {
    const data = review.toJSON ? review.toJSON() : review;

    return {
      id: data.id || data._id,
      business_id: data.business_id,
      user_id: data.user_id,
      user_name: data.user_name,
      user_avatar: data.user_avatar,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      created_at: data.created_at,
      updated_at: data.updated_at,
      helpful_count: data.helpful_count || 0,
      verified_purchase: data.verified_purchase || false,
    };
  }
}
