import { IReviewRepository } from "@domain/interfaces/IReviewRepository";
import { AppError } from "@shared/errors/AppError";

export class MarkReviewHelpfulUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    reviewId: string,
    userId: string
  ): Promise<{ helpful_count: number }> {
    // Check if review exists
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Check if already marked
    const hasMarked = await this.reviewRepository.hasMarkedHelpful(
      reviewId,
      userId
    );
    if (hasMarked) {
      throw new AppError("You have already marked this review as helpful", 409);
    }

    // Mark as helpful
    const marked = await this.reviewRepository.markAsHelpful(reviewId, userId);
    if (!marked) {
      throw new AppError("Failed to mark review as helpful", 500);
    }

    // Get updated review
    const updatedReview = await this.reviewRepository.findById(reviewId);
    return {
      helpful_count: updatedReview?.helpfulCount || 0,
    };
  }
}
