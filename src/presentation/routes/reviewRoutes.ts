import { Router } from "express";
import { ReviewController } from "@presentation/controllers/ReviewController";
import { authMiddleware } from "@infrastructure/middleware/authMiddleware";
import { adminMiddleware } from "@infrastructure/middleware/adminMiddleware";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { validate } from "@infrastructure/middleware/validator";
import {
  createReviewSchema,
  updateReviewSchema,
} from "@presentation/validators/reviewValidator";
import rateLimit from "express-rate-limit";

// Rate limiter for review creation
const createReviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 reviews per hour
  message: "Too many reviews created, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for helpful votes
const helpfulVoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 votes per hour
  message: "Too many helpful votes, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const createReviewRoutes = (
  reviewController: ReviewController,
  authService: IAuthService
): Router => {
  const router = Router();
  const auth = authMiddleware(authService);

  // ============================================
  // Public Endpoints
  // ============================================

  /**
   * GET /api/businesses/:businessId/reviews
   * Get all reviews for a business (supports anonymous access)
   */
  router.get(
    "/businesses/:businessId/reviews",
    reviewController.getBusinessReviews
  );

  // ============================================
  // Authenticated User Endpoints
  // ============================================

  /**
   * GET /api/reviews/user
   * Get current user's reviews
   */
  router.get("/reviews/user", auth, reviewController.getUserReviews);

  /**
   * POST /api/reviews
   * Create a new review
   */
  router.post(
    "/reviews",
    auth,
    createReviewLimiter,
    validate(createReviewSchema),
    reviewController.createReview
  );

  /**
   * PUT /api/reviews/:reviewId
   * Update a review
   */
  router.put(
    "/reviews/:reviewId",
    auth,
    validate(updateReviewSchema),
    reviewController.updateReview
  );

  /**
   * DELETE /api/reviews/:reviewId
   * Delete a review
   */
  router.delete("/reviews/:reviewId", auth, reviewController.deleteReview);

  /**
   * POST /api/reviews/:reviewId/helpful
   * Mark a review as helpful
   */
  router.post(
    "/reviews/:reviewId/helpful",
    auth,
    helpfulVoteLimiter,
    reviewController.markAsHelpful
  );

  return router;
};
