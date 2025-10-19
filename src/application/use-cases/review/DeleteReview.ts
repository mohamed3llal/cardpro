import { IReviewRepository } from "@domain/interfaces/IReviewRepository";
import { AppError } from "@shared/errors/AppError";

export class DeleteReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    reviewId: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<void> {
    // Check if review exists
    const exists = await this.reviewRepository.exists(reviewId);
    if (!exists) {
      throw new AppError("Review not found", 404);
    }

    // Check ownership (unless admin)
    if (!isAdmin) {
      const isOwner = await this.reviewRepository.isOwner(reviewId, userId);
      if (!isOwner) {
        throw new AppError("You can only delete your own reviews", 403);
      }
    }

    const deleted = await this.reviewRepository.delete(reviewId);
    if (!deleted) {
      throw new AppError("Failed to delete review", 500);
    }
  }
}
